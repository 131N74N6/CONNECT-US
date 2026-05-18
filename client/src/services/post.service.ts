import { Query, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MediaFile, PostDetail, PostItemProps, PostServiceIntrf } from "../models/post-model";
import { uploadToCloudinary } from "./cloudiary.service";
import AuthServices from "./auth-service";
import { useNavigate } from "react-router-dom";
import DataModifier from "./data.service";
import { useRef, useState } from "react";

export default function PostServices(props?: PostServiceIntrf) {
    const postFolder = 'sns_posts';
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();
    const navigate = useNavigate();
    const { deleteData, deleteChosenData, error, getData, insertData, infiniteScroll, setError, updateData } = DataModifier();

    const [description, setDescription] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [existingFiles, setExistingFiles] = useState<{ file_url: string; public_id: string }[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newMediaFiles: MediaFile[] = [];

        for (let r = 0; r < files.length; r++) {
            const file = files[r];
            const previewUrl = URL.createObjectURL(file);
            const fileType = file.type.split('/')[0];
            
            if (fileType !== 'image' && fileType !== 'video') {
                URL.revokeObjectURL(previewUrl);
                continue;
            }
            
            newMediaFiles.push({ file, previewUrl, type: fileType as 'image' | 'video' });
        }

        setMediaFiles(prev => [...prev, ...newMediaFiles]);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const removeMediaFile = (index: number) => {
        const fileToRemove = mediaFiles[index];
        URL.revokeObjectURL(fileToRemove.previewUrl);
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    }

    const insertMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!currentUserId) return;

            const getCurrentDate = new Date();
            const postsFiles: { file_url: string; public_id: string; }[] = [];
            
            for (const mediaFile of mediaFiles) {
                const result = await uploadToCloudinary(mediaFile.file, postFolder);
                postsFiles.push({ file_url: result.url, public_id: result.publicId });
            }

            await insertData<PostDetail>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/posts/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    description: description.trim(),
                    posts_file: postsFiles,
                    uploader_name: currentUsername,
                    user_id: currentUserId,
                }
            });
        },
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            setDescription('');
            setMediaFiles([]);
            navigate('/home');
        },
        onSettled: () => setIsProcessing(false),
    });

    const { 
        error: allPostError, 
        data: allPostsData, 
        isLoading: allPostsIsLoading, 
        isReachedEnd: allPostsReachedEnd, 
        isLoadingMore: allPostsLoadMore, 
        fetchNextPage: allPostsNextPage
    } = infiniteScroll<PostItemProps>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/posts/get-all`, 
        limit: 12,
        query_key: ['all-posts'],
        stale_time: 1800000
    });

    const allPosts = { allPostError, allPostsData, allPostsIsLoading, allPostsReachedEnd, allPostsLoadMore, allPostsNextPage }

    const deleteAllPostMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!currentUserId || !window.confirm('Are you sure you want to delete this post?')) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-all/${currentUserId}`);
        }, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith(`like_`) || queryKey[0].startsWith(`comments-`) || 
                        queryKey[0].startsWith(`user-post-total-`) || queryKey[0].startsWith(`user-connection-stats-`);
                    }
                    return false;
                }
            });
            queryClient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            navigate(`/about/${currentUserId}`);
        },
        onError: () => {},
        onSettled: () => setIsProcessing(false)
    });

    const deletePostMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async (id: string) => await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase/${id}`),
        onError: () => {},
        onSuccess: () => {
            queryClient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith('selected-post-');
                    }
                    return false; 
                }
            });
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            navigate('/home');
        },
        onSettled: () => setIsProcessing(false),
    });

    function removeExistingFile(public_id: string) {
        setExistingFiles(prev => prev.filter(file => file.public_id !== public_id));
        setSelectedFiles(prev => [...prev, public_id]);
    }

    const { 
        error: currentUserPostsError,
        data: currentUserPosts, 
        isLoading: loadPosts, 
        isReachedEnd: postReachEnd, 
        isLoadingMore: loadPostOwner, 
        fetchNextPage: setCurrentUserPosts, 
    } = infiniteScroll<PostItemProps>({
        api_url: props ? `${import.meta.env.VITE_API_BASE_URL}/posts/signed-user/${props.user_id}` : '',
        limit: 12,
        query_key: [`signed-user-posts-${props?.user_id}`],
        stale_time: 1800000
    });

    const allCurrentUserPosts = { currentUserPostsError, currentUserPosts, loadPosts, postReachEnd, loadPostOwner, setCurrentUserPosts }

    const updatePostMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            const newPostsFiles: { file_url: string; public_id: string; }[] = [];
            
            for (const mediaFile of mediaFiles) {
                const result = await uploadToCloudinary(mediaFile.file, postFolder);
                newPostsFiles.push({ file_url: result.url, public_id: result.publicId });
            }
        
            if (selectedFiles.length > 0) {
                await deleteChosenData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-chosen`, selectedFiles);
            }

            await updateData<PostDetail>({
                api_url: props ? `${import.meta.env.VITE_API_BASE_URL}/posts/edit/${props.id}` : '',
                data: {
                    description: description.trim(),
                    posts_file: [...existingFiles, ...newPostsFiles],
                }
            });
        },
        onError: () => {},
        onSuccess: () => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith('edit-selected-post-');
                    }
                    return false; 
                }
            });
            queryClient.invalidateQueries({ queryKey: [`signed-user-posts-${currentUserId}`] });
            navigate(`/about/${currentUserId}`);
        },
        onSettled: () => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setIsProcessing(false);
            setDescription('');
            setMediaFiles([]);
            setExistingFiles([]);
            setSelectedFiles([]);
        },
    });

    const { data: selectedPost, error: errorPost, isLoading: postLoading } = getData<PostDetail[]>({
        api_url: props ? `${import.meta.env.VITE_API_BASE_URL}/posts/selected/${props.id}` : '',
        query_key: [`selected-post-${props?.id}`],
        stale_time: 1800000
    });

    const selectedPostData = { errorPost, postLoading, selectedPost }

    const { data: userPostTotal } = getData<number>({
        api_url: props ? `${import.meta.env.VITE_API_BASE_URL}/posts/post-total/${props.user_id}` : '',
        query_key: [`user-post-total-${props?.user_id}`],
        stale_time: 1800000
    });

    return { 
        allPosts, allCurrentUserPosts, currentUserId, currentUsername, description, deleteAllPostMutation, deletePostMutation, 
        error, existingFiles, fileInputRef, handleFileSelect, insertMutation, isProcessing, mediaFiles, navigate, 
        selectedPostData, userPostTotal, removeExistingFile, removeMediaFile, selectedFiles, setDescription, setError, 
        setExistingFiles, setIsProcessing, updatePostMutation
    }
}