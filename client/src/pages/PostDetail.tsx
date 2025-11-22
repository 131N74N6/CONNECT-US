import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { ILikes, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import ImageSlider from "../components/ImageSlider";
import { useEffect, useMemo, useState } from "react";
import VideoSlider from "../components/VideoSlider";
import Notification from "../components/Notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PostDetail() {
    const { _id } = useParams();
    const { user } = useAuth();
    const { deleteData, getData, insertData } = DataModifier();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [error, setError] = useState({ isError: false, message: '' });

    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const { data: selectedPost, error: errorPost, isLoading: postLoading } = getData<PostDetail[]>({
        api_url: `http://localhost:1234/posts/selected/${_id}`, 
        query_key: [`selected-post-${_id}`],
        stale_time: 600000
    });

    const { data: commentsTotal } = getData<number>({
        api_url: `http://localhost:1234/comments/comment-total/${_id}`, 
        query_key: [`comments-total-${_id}`],
        stale_time: 600000
    });

    const { data: likesTotal } = getData<number>({
        api_url: `http://localhost:1234/likes/likes-total/${_id}`, 
        query_key: [`likes-total-${_id}`],
        stale_time: 600000
    });

    const { data: hasUserLiked } = getData<boolean>({
        api_url: `http://localhost:1234/likes/has-liked?post_id=${_id}&user_id=${user?.info.id}`, 
        query_key: [`has-liked-${user?.info.id}`],
        stale_time: 600000
    });

    const userLiked = hasUserLiked;

    const countCommentTotal = useMemo(() => {
        if (!commentsTotal) return 0;
        return commentsTotal;
    }, [_id, commentsTotal]);

    const countLikesTotal = useMemo(() => {
        if (!likesTotal) return 0;
        return likesTotal;
    }, [_id, likesTotal]);

    const giveLikeMutation = useMutation({
        onMutate: () => setIsLiking(true),
        mutationFn: async () => {
            const getCurrentDate = new Date();
            if (!user || !_id || !selectedPost) return;

            await insertData<ILikes>({
                api_url: `http://localhost:1234/likes/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    post_id: _id,
                    user_id: user.info.id,
                    username: user.info.username,
                    post_owner_id: selectedPost[0].user_id
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${user?.info.id}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${_id}`] });
        },
        onSettled: () => setIsLiking(false),
        onError: () => setError({ isError: true, message: 'Failed to give like' })
    });

    const startDislikeMutation = useMutation({
        onMutate: () => setIsLiking(true),
        mutationFn: async () => {
            if (!user) return;
            await deleteData(`http://localhost:1234/likes/erase/${user.info.id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${user?.info.id}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${_id}`] });
        },
        onSettled: () => setIsLiking(false),
        onError: () => setError({ isError: true, message: 'Failed to dislike' })
    });

    const deletePostMutation = useMutation({
        onMutate: () => setIsLiking(true),
        mutationFn: async () => await deleteData(`http://localhost:1234/posts/erase/${_id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`selected-post-${_id}`] });
            navigate('/home');
        },
        onSettled: () => setIsLiking(false),
        onError: () => setError({ isError: true, message: 'Failed to delete post.' })
    });
    
    function givingLikes(): void {
        if (isLiking) return;
        if (!userLiked) giveLikeMutation.mutate();
        else startDislikeMutation.mutate();
    }

    function handleDeletePost(): void {
        if (!_id) return;
        if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;
        deletePostMutation.mutate();
    }

    if (postLoading) return <Loading/>;

    const isPostOwner = user ? user.info.id === selectedPost?.[0]?.user_id : false;

    // Separate images and videos
    const getSelectedMediaFiles = selectedPost?.[0]?.posts_file;
    const images = getSelectedMediaFiles ? getSelectedMediaFiles.filter(file => file.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/) !== null) : [];
    const videos = getSelectedMediaFiles ? getSelectedMediaFiles.filter(url => url.file_url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/) !== null) : [];

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1 />
            <Navbar2 />
            {error.isError ? <Notification class_name="" message={error.message}/> : null}
            <div className="md:w-3/4 w-full min-h-[300px] flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg overflow-y-auto p-[0.8rem]">
                {errorPost ? <span>{errorPost.message}</span> : null}
                {postLoading ? <div className="flex justify-center items-center h-full"><Loading/></div> : null}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            {selectedPost?.[0]?.uploader_name.charAt(0)}
                        </div>
                        <div>
                            <Link to={`/about/${selectedPost?.[0]?.user_id}`} className="font-semibold">
                                {selectedPost?.[0]?.uploader_name}
                            </Link>
                            <p className="text-gray-400 text-sm">
                                {selectedPost && new Date(selectedPost?.[0]?.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    {isPostOwner ? (
                        <button
                            onClick={handleDeletePost}
                            className="bg-red-600 cursor-pointer hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Delete This Post
                        </button>
                    ) : null}
                </div>
                
                <div className="flex flex-col gap-[1rem]">
                    {images.length > 0 ? <ImageSlider images={images} /> : null}
                    {videos.length > 0 ? <VideoSlider videos={videos}/> : null}
            
                    <div className="flex gap-[1rem]">
                        <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                            <i 
                                className={`fa-${userLiked ? 'solid' : 'regular'} fa-heart cursor-pointer ${userLiked ? 'text-red-500' : ''}`} 
                                onClick={givingLikes}
                            ></i>
                            <span>
                                {countLikesTotal}
                            </span>
                        </div>
                        <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                            <Link to={`/comments-post/${_id}`}>
                                <i className="fa-regular fa-comment cursor-pointer"></i>
                            </Link>
                            <span>{countCommentTotal}</span>
                        </div>
                    </div>
                    <div className="text-gray-200">{selectedPost?.[0]?.description}</div>
                </div>
            </div>
        </section>
    );
}