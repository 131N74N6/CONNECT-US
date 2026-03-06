import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import DataModifier from "../services/data.service";
import useAuth from "../services/auth.service";
import type { LikeDataProps, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import Notification from "../components/Notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PostSider from "../components/PostSider";

export default function PostDetail() {
    const { _id } = useParams();
    const { user } = useAuth();
    const { deleteData, getData, insertData } = DataModifier();
    const navigate = useNavigate();
    
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState({ isError: false, message: '' });
    const queryClient = useQueryClient();
    const currentUserId = user ? user.info.id : '';

    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const { data: selectedPost, error: errorPost, isLoading: postLoading } = getData<PostDetail[]>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/posts/selected/${_id}`, 
        query_key: [`selected-post-${_id}`],
        stale_time: 1800000
    });

    const { data: commentsTotal } = getData<number>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/comments/comment-total/${_id}`, 
        query_key: [`comments-total-${_id}`],
        stale_time: 1800000
    });

    const { data: likesTotal } = getData<number>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/likes-total/${_id}`, 
        query_key: [`likes-total-${_id}`],
        stale_time: 1800000
    });

    const { data: hasUserLiked } = getData<boolean>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/has-liked?post_id=${_id}&user_id=${currentUserId}`, 
        query_key: [`has-liked-${currentUserId}`],
        stale_time: 1800000
    });
    
    const isPostOwner = user ? user.info.id === selectedPost?.[0]?.user_id : false;
    const isLiked = hasUserLiked ? hasUserLiked : false;

    const giveLikeMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            const getCurrentDate = new Date();
            if (!user || !_id || !selectedPost) return;

            await insertData<LikeDataProps>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/add`,
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
            queryClient.invalidateQueries({ queryKey: [`has-liked-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${_id}`] });
        },
        onSettled: () => setIsProcessing(false),
        onError: () => setError({ isError: true, message: 'Failed to give like' })
    });

    const startDislikeMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!user) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/likes/erase/${user.info.id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${_id}`] });
        },
        onSettled: () => setIsProcessing(false),
        onError: () => setError({ isError: true, message: 'Failed to dislike' })
    });

    const deletePostMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase/${_id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`selected-post-${_id}`] });
            navigate('/home');
        },
        onSettled: () => setIsProcessing(false),
        onError: () => setError({ isError: true, message: 'Failed to delete post.' })
    });
    
    function givingLikes(): void {
        if (isProcessing) return;
        if (!isLiked) giveLikeMutation.mutate();
        else startDislikeMutation.mutate();
    }

    function handleDeletePost(): void {
        if (!_id) return;
        if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;
        deletePostMutation.mutate();
    }

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1 />
            {error.isError ? 
                <Notification 
                    class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] h-[88px] text-[2rem] font-[600] text-purple-700" 
                    message={error.message}
                /> : 
            null}
            <div className="md:w-3/4 w-full h-full flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg p-[0.8rem]">
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
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => navigate(`/edit-post/${_id}`)}
                                disabled={isProcessing}
                                className="bg-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-medium hover:bg-amber-600 md:p-1.5 p-[0.12rem] md:w-18 w-10 rounded-lg md:text-md text-base"
                            >
                                <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                                onClick={handleDeletePost}
                                disabled={isProcessing}
                                className="bg-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-medium hover:bg-amber-600 md:p-1.5 p-[0.12rem] md:w-18 w-10 rounded-lg md:text-md text-base"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ) : null}
                </div>
                <div className="flex flex-col gap-[1rem]">
                    {selectedPost && selectedPost[0].posts_file && selectedPost[0].posts_file.length !== 0 ? (
                        <PostSider post_files={selectedPost[0].posts_file}/>
                    ) : null}
                    <div className="flex gap-[1rem]">
                        <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                            <button
                                type="button" 
                                disabled={isProcessing}
                                className={`fa-${isLiked ? 'solid' : 'regular'} disabled:opacity-50 disabled:cursor-not-allowed fa-heart cursor-pointer ${isLiked ? 'text-red-500' : 'text-white'}`} 
                                onClick={givingLikes}
                            >
                            </button>
                            <Link to={`/like-post/${_id}`}>{likesTotal ? likesTotal : 0}</Link>
                        </div>
                        <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                            <Link to={`/comments-post/${_id}`}>
                                <i className="fa-regular fa-comment text-white"></i>
                            </Link>
                            <span>{commentsTotal ? commentsTotal : 0}</span>
                        </div>
                    </div>
                    <div className="text-gray-200">{selectedPost?.[0]?.description}</div>
                </div>
            </div>
            <Navbar2/>
        </section>
    );
}