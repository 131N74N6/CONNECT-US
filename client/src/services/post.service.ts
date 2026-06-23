import { Query, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MediaFile, PostDetail, PostItemProps, PostServiceIntrf } from "../models/post_model";
import { uploadToCloudinary } from "./cloudiary.service";
import AuthServices from "./auth.service";
import { useNavigate } from "react-router-dom";
import DataModifier from "./data.service";
import { useRef, useState } from "react";

export default function PostServices(props?: PostServiceIntrf) {
    const postFolder = 'sns_posts';
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { currentUserId, currentUsername } = AuthServices();
    const { deleteData, deleteChosenData, getData, insertData, infiniteScroll, updateData } = DataModifier();

    const [description, setDescription] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [existingFiles, setExistingFiles] = useState<{ file_url: string; public_id: string }[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

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
        onError: (error) => {
            props?.set_message(error.message || 'Failed to create post. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
            queryClient.invalidateQueries({ queryKey: [`signed-user-posts-${currentUserId}`] });
            setDescription('');
            setMediaFiles([]);
            navigate(`/about/${currentUserId}`);
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
        query_params: !!currentUserId,
        stale_time: Infinity
    });

    const allPosts = { allPostError, allPostsData, allPostsIsLoading, allPostsReachedEnd, allPostsLoadMore, allPostsNextPage }

    const deletePostMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!props || !props.id) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase/${props.id}`);
        },
        onError: (error) => {
            props?.set_message(error.message || 'Failed to delete post. Try again later');
        },
        onSuccess: () => {
            queryClient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith('selected-post-') || 
                        queryKey[0].startsWith('comments-total-') || 
                        queryKey[0].startsWith('comments-') || 
                        queryKey[0].startsWith('has-liked-') ||
                        queryKey[0].startsWith('likes-') ||
                        queryKey[0].startsWith('likes-total-');
                    }
                    return false; 
                }
            });
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.invalidateQueries({ queryKey: [`user-post-total-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`signed-user-posts-${currentUserId}`] });
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
        query_params: !!props?.user_id,
        stale_time: Infinity
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
        onError: (error) => {
            props?.set_message(error.message || 'Failed to update post. Try again later');
        },
        onSuccess: () => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            queryClient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith('edit-selected-post-') ||
                        queryKey[0].startsWith('selected-post-');
                    }
                    return false; 
                }
            });
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
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
        query_params: !!props?.id,
        stale_time: Infinity
    });

    const selectedPostData = { errorPost, postLoading, selectedPost }

    const { data: userPostTotal } = getData<number>({
        api_url: props ? `${import.meta.env.VITE_API_BASE_URL}/posts/post-total/${props.user_id}` : '',
        query_key: [`user-post-total-${props?.user_id}`],
        query_params: !!props?.user_id,
        stale_time: Infinity
    });

    return { 
        allPosts, allCurrentUserPosts, currentUserId, currentUsername, description, deletePostMutation, existingFiles, 
        fileInputRef, handleFileSelect, insertMutation, isProcessing, mediaFiles, navigate, 
        selectedPostData, userPostTotal, removeExistingFile, removeMediaFile, selectedFiles, setDescription, 
        setExistingFiles, setIsProcessing, updatePostMutation
    }
}