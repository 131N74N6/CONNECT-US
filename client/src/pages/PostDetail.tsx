import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { IComments, ILikes, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import ImageSlider from "../components/ImageSlider";
import { useEffect, useMemo, useState } from "react";
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
    const [isSendComment, setIsSendComment] = useState<boolean>(false);
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
        api_url: _id ? `http://localhost:1234/comments/get-all/${_id}` : ``, 
        limit: 12,
        stale_time: 1000,
        query_key: `comments-${_id}`
    });

    const { data: selectedPost, error: errorPost, isLoading: postLoading } = getData<PostDetail[]>(
        _id ? `http://localhost:1234/posts/selected/${_id}` : ``, [`selected-post-${_id}`]
    );

    const { data: likesData } = getData<ILikes[]>(
        _id ? `http://localhost:1234/likes/get-all/${_id}` : ``, [`likes-${_id}`]
    );

    const userLiked = useMemo(() => {
        if (!_id || !likesData?.data || !user) return false;
        if (!Array.isArray(likesData.data)) return false;
        
        return likesData.data.some((like: ILikes) => like.user_id === user.info.id && like.post_id === _id);
    }, [_id, likesData, user]);

    const likeMutation = useMutation({
        onMutate: () => {
            if (isLiking) return;
            setIsLiking(true);
        },
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
                        post_owner_id: selectedPost.data[0].user_id
                    }
                });
            } else {
                await deleteData(`http://localhost:1234/likes/erase/${user.info.id}`);
            } 
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [`likes-${_id}`] }),
        onSettled: () => setIsLiking(false),
        onError: () => setError({ isError: true, message: 'Failed to give like' })
    });

    const commentMutation = useMutation({
        onMutate: () => {
            if (isSendComment) return;
            setIsSendComment(true);
        },
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
                    post_owner_id: selectedPost.data[0].user_id
                }
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [`comments-${_id}`] }),
        onSettled: () => {
            setComment('');
            setIsSendComment(false);
        },
        onError: () => setError({ isError: true, message: error.message || 'Failed to send comment' })
    });

    const deletePostMutation = useMutation({
        mutationFn: async () => {
            if (!_id) return;
            if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;

            await deleteData(`http://localhost:1234/posts/erase/${_id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`selected-post-${_id}`] });
            navigate('/home');
        },
        onError: () => setError({ isError: true, message: 'Failed to delete post.' })
    });

    function sendComment(event: React.FormEvent): void {
        event.preventDefault();
        commentMutation.mutate();
    }
    
    function givingLikes(): void {
        likeMutation.mutate();
    }

    function handleDeletePost(): void {
        deletePostMutation.mutate();
    }

    if (postLoading) return <Loading />;

    const postDetail = selectedPost?.data?.[0];
    const isPostOwner = user && postDetail && user.info.id === postDetail.user_id;

    // Separate images and videos
    const images = postDetail?.posts_file ? 
        postDetail.posts_file.filter(file => 
            file.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ) : [];

    const videos = postDetail?.posts_file ? 
        postDetail.posts_file.filter(file => 
            file.file_url?.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i)
        ) : [];

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
                            {postDetail?.uploader_name.charAt(0)}
                        </div>
                        <div>
                            <Link to={`/about/${postDetail?.user_id}`} className="font-semibold">
                                {postDetail?.uploader_name || 'Unknown User'}
                            </Link>
                            <p className="text-gray-400 text-sm">
                                {selectedPost && new Date(selectedPost.data[0].created_at).toLocaleString()}
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
                        likesData={likesData?.data}
                        setOpenComments={setOpenComments}
                        userLiked={userLiked}
                    />
                    <div className="text-gray-200">{postDetail?.description}</div>
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
                    /> 
                : null}
            </div>
        </div>
    );
}