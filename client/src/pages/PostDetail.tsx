import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { IComments, ILikes, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import Error from "./Error";
import PostSlider from "../components/PostSlider";
import { deleteFromCloudinary } from "../services/media-storage";
import { useState } from "react";
import CommentField from "../components/CommentField";
import useSWR from "swr";

export default function PostDetail() {
    const { _id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [comment, setComment] = useState<string>('');
    const [openComments, setOpenComments] = useState<boolean>(false);
    const { deleteData: deletePost, getData: getSelectedPost } = DataModifier();
    const { deleteData: dislike, getData: getLikeData, insertData: giveLike } = DataModifier();
    const { deleteData: deleteComment, getData: getCommentData, insertData: insertComment } = DataModifier();

    const { data: selectedPost, isLoading: postLoading, mutate: mutatePost } = useSWR<PostDetail[]>(
        _id ? `http://localhost:1234/posts/selected/${_id}` : '',
        getSelectedPost,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: likesData, mutate: likeMutate } = useSWR<ILikes[]>(
        _id ? `http://localhost:1234/likes/get-all/${_id}` : '',
        getLikeData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: commentsData, mutate: commentMutate } = useSWR<IComments[]>(
        _id ? `http://localhost:1234/comments/get-all/${_id}` : '',
        getCommentData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const userLiked = user && likesData ? likesData.some(like => like.user_id === user.info.id) : [];

    async function sendComment(event: React.FormEvent) {
        event.preventDefault();
        const getCurrentDate = new Date();

        try {    
            if (!user) throw 'Invalid user data';
            if (!_id) throw 'Failed to get post';
            if (!comment.trim()) throw 'Missing required data';

            await insertComment<IComments>({
                api_url: `http://localhost:1234/comments/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    opinions: comment.trim(),
                    post_id: _id,
                    user_id: user.info.id,
                    username: user.info.username
                }
            });

            commentMutate();
        } catch (error: any) {
            console.log(error.message);
        } finally {
            setComment('');
        }
    }
    
    async function givingLikes() {
        const getCurrentDate = new Date();
        try {
            if (!user || !likesData) return;
            if (!_id) throw 'Failed to get post';

            const existingLike = likesData.find(like => like.user_id === user.info.id && like.post_id === _id);

            if (!existingLike) {
                await giveLike<ILikes>({
                    api_url: `http://localhost:1234/likes/add`,
                    data: {
                        created_at: getCurrentDate.toISOString(),
                        post_id: _id,
                        user_id: user.info.id,
                    }
                });
                likeMutate();
            } else {
                await dislike(`http://localhost:1234/likes/erase/${user.info.id}`);
                likeMutate();
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    const handleDeletePost = async () => {
        if (!_id) return;
        if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;

        try {
            if (selectedPost[0].file_url && selectedPost[0].file_url.length > 0) {
                const deletePromises = selectedPost[0].file_url.map(url => {
                    const parts = url.split('/');
                    const publicId = parts[parts.length - 1].split('.')[0];
                    return deleteFromCloudinary(publicId, url.includes('.mp4') ? 'video' : 'image');
                });

                await Promise.all(deletePromises);
            }

            await deletePost(`http://localhost:1234/posts/erase/${_id}`);
            mutatePost();

            await dislike(`http://localhost:1234/likes/erase-all/${_id}`);
            likeMutate();

            await deleteComment(`http://localhost:1234/comments/erase-all/${_id}`);
            commentMutate();

            navigate('/home');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    };

    if (postLoading) return <Loading />;

    if (!selectedPost) return <Error message={'404 | NOT FOUND'} />;

    // Check if the current user is the post owner
    const isPostOwner = user && user.info.id === selectedPost[0].user_id;

    // Separate images and videos
    const images = selectedPost[0].file_url?.filter(url => url.match(/\.(jpeg|jpg|gif|png)$/) !== null) || [];

    const videos = selectedPost[0].file_url?.filter(url => url.match(/\.(mp4|webm|ogg)$/) !== null) || [];

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1 />
            <Navbar2 />
            
            <div className="md:w-3/4 w-full min-h-[300px] flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg overflow-y-auto p-[0.8rem]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            {selectedPost[0].uploader_name.charAt(0)}
                        </div>
                        <div>
                            <Link to={`/about/${selectedPost[0].user_id}`} className="font-semibold">
                                {selectedPost[0].uploader_name || 'Unknown User'}
                            </Link>
                            <p className="text-gray-400 text-sm">{new Date(selectedPost[0].created_at).toLocaleString()}</p>
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
                    {images.length > 0 ? <PostSlider images={images} /> : null}
                    
                    {videos.map((videoUrl, index) => (
                        <div key={index} className="w-full bg-gray-900 rounded-lg overflow-hidden">
                            <video 
                                controls 
                                className="w-full h-auto max-h-96 object-contain"
                            >
                            <source src={videoUrl} type="video/mp4" />Your browser does not support the video tag.</video>
                        </div>
                    ))}
            
                    <div>
                        <div className="text-gray-200 h-[90%] overflow-y-auto">{selectedPost[0].description}</div>
                        <div className="flex gap-[1rem]">                            
                            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                                <i 
                                    className={`fa-${userLiked ? 'solid' : 'regular'} fa-heart cursor-pointer ${userLiked ? 'text-red-500' : ''}`} 
                                    onClick={givingLikes}
                                ></i>
                                <span>{likesData ? likesData.length : 0}</span>
                            </div>
                            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                                <i className="fa-regular fa-comment cursor-pointer" onClick={() => setOpenComments(true)}></i>
                                <span>{commentsData ? commentsData.length : 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form className="flex flex-col gap-[1rem]" onSubmit={sendComment}>
                    <h3 className="text-center">Write your comment here</h3>
                    <textarea 
                        value={comment}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setComment(event.target.value)}
                        className="resize-none w-full h-[70px] outline-0 border-white border p-[0.3rem]"
                    ></textarea>
                    <button 
                        type="submit" 
                        className="cursor-pointer bg-purple-400 p-[0.45rem] rounded-[0.45rem]"
                    >
                        <span className="text-[1rem] font-[550] text-black">Send</span>
                    </button>
                </form>

                {openComments ? 
                    <CommentField 
                        onClose={() => setOpenComments(false)} 
                        comments_data={commentsData ? commentsData : []}
                    /> 
                : null}
            </div>
        </div>
    );
}