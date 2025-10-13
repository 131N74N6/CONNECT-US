import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { IComments, ILikes, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import ImageSlider from "../components/ImageSlider";
import { useEffect, useState } from "react";
import CommentField from "../components/CommentField";
import LikeField from "../components/LikeField";
import VideoSlider from "../components/VideoSlider";
import Notification from "../components/Notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PostDetail() {
    const { _id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { deleteData, getData, infiniteScroll, insertData } = DataModifier();
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [comment, setComment] = useState<string>('');
    const [openComments, setOpenComments] = useState<boolean>(false);
    const [error, setError] = useState({ isError: false, message: '' });

    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const {
        data: paginatedComment,
        isReachedEnd: commentsReachedEnd,
        isLoadingMore: loadMoreComments,
        fetchNextPage: fetchMoreComments,
    } =  infiniteScroll<IComments>({
        api_url: `http://localhost:1234/comments/get-all/${_id}`, 
        limit: 12,
        stale_time: 1000,
        query_key: `comments-${_id}`
    });

    const { data: selectedPost, error: errorPost, isLoading: postLoading } = getData(
        `http://localhost:1234/posts/selected/${_id}`, [`selected-post-${_id}`]
    );

    const { data: likesData } = getData(
        `http://localhost:1234/likes/get-all/${_id}`, [`likes-${_id}`]
    );

    const userLiked = _id && likesData && user && likesData.some(like => like.user_id === user.info.id && like.post_id === _id);

    const likeMutation = useMutation({
        mutationFn: async () => {
            const getCurrentDate = new Date();
            if (!user || !_id || !selectedPost) return;

            if (!userLiked) {
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
            } else {
                await deleteData(`http://localhost:1234/likes/erase/${user.info.id}`);
            } 
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${_id}`] });
        }
    });

    const commentMutation = useMutation({
        mutationFn: async () => {
            const getCurrentDate = new Date();
            
            if (!user || !_id || !selectedPost) return;
            if (!comment.trim()) return;

            await insertData<IComments>({
                api_url: `http://localhost:1234/comments/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    opinions: comment.trim(),
                    post_id: _id,
                    user_id: user.info.id,
                    username: user.info.username,
                    post_owner_id: selectedPost[0].user_id
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`comments-${_id}`] });
        }
    });

    async function sendComment(event: React.FormEvent) {
        event.preventDefault();

        try {    
            commentMutation.mutate();
        } catch (error: any) {
            setError({ isError: true, message: error.message || 'Failed to send comment' });
        } finally {
            setComment('');
        }
    }
    
    async function givingLikes() {
        if (isLiking) return;
        setIsLiking(true);
        try {
            likeMutation.mutate();
        } catch (error: any) {
            setError({ isError: true, message: 'Failed to give like' });
        } finally {
            setIsLiking(false);
        }
    }

    const handleDeletePost = async () => {
        if (!_id) return;
        if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await deleteData(`http://localhost:1234/posts/erase/${_id}`);
            navigate('/home');
        } catch (error) {
            setError({ isError: true, message: 'Failed to delete post.' });
        }
    };

    if (postLoading) return <Loading />;

    const isPostOwner = user && user.info.id === selectedPost[0].user_id;

    // Separate images and videos
    const images = selectedPost[0].posts_file ? 
        selectedPost[0].posts_file.filter(file => file.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/) !== null) : [];

    const videos = selectedPost[0].posts_file ? 
        selectedPost[0].posts_file.filter(url => url.file_url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/) !== null) : [];

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1 />
            <Navbar2 />
            {error.isError ? <Notification class_name="" message={error.message}/> : null}
            <div className="md:w-3/4 w-full min-h-[300px] flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg overflow-y-auto p-[0.8rem]">
                {errorPost ? <span>{errorPost.message}</span> : null}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            {selectedPost[0].uploader_name.charAt(0)}
                        </div>
                        <div>
                            <Link to={`/about/${selectedPost[0].user_id}`} className="font-semibold">
                                {selectedPost[0].uploader_name || 'Unknown User'}
                            </Link>
                            <p className="text-gray-400 text-sm">
                                {new Date(selectedPost[0].created_at).toLocaleString()}
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
            
                    <LikeField
                        commentsData={paginatedComment}
                        givingLikes={givingLikes}
                        likesData={likesData}
                        setOpenComments={setOpenComments}
                        userLiked={userLiked}
                    />
                    <div className="text-gray-200">{selectedPost[0].description}</div>
                </div>

                {openComments ? 
                    <CommentField 
                        onClose={setOpenComments} 
                        comments_data={paginatedComment}
                        comment={comment}
                        isReachedEnd={commentsReachedEnd}
                        loadMore={loadMoreComments || false}
                        setComment={setComment}
                        sendComment={sendComment}
                        setSize={fetchMoreComments}
                        size={commentSize}
                    /> 
                : null}
            </div>
        </div>
    );
}