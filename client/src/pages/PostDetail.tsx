import { useParams, useNavigate } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { getSelectedData, insertData, realTimeInit } from "../services/useFirestore";
import { deleteData } from "../services/useFirestore";
import useAuth from "../services/useAuth";
import type { IComments, ILikes, NewComment, NewPost } from "../services/custom-types";
import Loading from "../components/Loading";
import Error from "./Error";
import PostSlider from "../components/PostSlider";
import { deleteFromCloudinary } from "../services/useFileStorage";
import { useState } from "react";
import CommentField from "../components/CommentField";

export default function PostDetail() {
    const postCollection = 'posts';
    const commentCollection = 'comments';
    const likeCollection = 'likes';

    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [comment, setComment] = useState<string>('');
    const [openComments, setOpenComments] = useState<boolean>(false);
    
    const { data: selectedPost, loading } = getSelectedData<NewPost>({
        collection_name: postCollection,
        values: id ? id : ''
    });

    const { data: commentsData } = realTimeInit<IComments>({
        collection_name: commentCollection,
        order_by_options: [['created_at', 'desc']],
        filters: id ? [['post_id', '==', id]] : []
    });

    const { data: likesData } = realTimeInit<ILikes>({
        collection_name: likeCollection,
        order_by_options: [['created_at', 'desc']],
        filters: id ? [['post_id', '==', id]] : []
    });

    const userLiked = user && likesData.some(like => like.user_id === user.uid);

    async function sendComment(event: React.FormEvent) {
        event.preventDefault();
        try {    
            if (!user || !user.displayName) throw 'Invalid user data';
            if (!id) throw 'Failed to get post';
            if (!comment.trim()) throw 'Missing required data';

            await insertData<NewComment>({
                collectionName: commentCollection,
                data: {
                    opinion: comment.trim(),
                    post_id: id,
                    user_id: user.uid,
                    username: user.displayName
                }
            });
        } catch (error: any) {
            console.log(error.message);
        } finally {
            setComment('');
        }
    }
    
    async function givingLikes() {
        try {
            if (!user || !user.displayName) throw 'Invalid user data';
            if (!id) throw 'Failed to get post';

            const existingLike = likesData.find(like => like.user_id === user.uid && like.post_id === id);

            if (!existingLike) {
                await insertData<ILikes>({
                    collectionName: likeCollection,
                    data: {
                        post_id: id,
                        user_id: user.uid,
                        username: user.displayName
                    }
                });
            } else {
                await deleteData({
                    collectionName: likeCollection,
                    values: existingLike.id
                });
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    const handleDeletePost = async () => {
        if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;

        try {
            if (selectedPost.file_url && selectedPost.file_url.length > 0) {
                const deletePromises = selectedPost.file_url.map(url => {
                    const parts = url.split('/');
                    const publicId = parts[parts.length - 1].split('.')[0];
                    return deleteFromCloudinary(publicId, url.includes('.mp4') ? 'video' : 'image');
                });

                await Promise.all(deletePromises);
            }

            await deleteData({
                collectionName: postCollection,
                values: selectedPost.id
            });

            await deleteData({
                collectionName: commentCollection,
                values: selectedPost.id
            });

            await deleteData({
                collectionName: likeCollection,
                values: selectedPost.id
            });

            navigate('/home');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    };

    if (loading) return <Loading />;

    if (!selectedPost) return <Error message={'404 | NOT FOUND'} />;

    // Check if the current user is the post owner
    const isPostOwner = user && user.uid === selectedPost.user_id;

    // Separate images and videos
    const images = selectedPost.file_url?.filter(url => url.match(/\.(jpeg|jpg|gif|png)$/) !== null) || [];

    const videos = selectedPost.file_url?.filter(url => url.match(/\.(mp4|webm|ogg)$/) !== null) || [];

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1 />
            <Navbar2 />
            
            <div className="md:w-3/4 w-full flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg overflow-y-auto p-[0.8rem]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            {selectedPost.uploader_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 className="font-semibold">{selectedPost.uploader_name || 'Unknown User'}</h3>
                            <p className="text-gray-400 text-sm">{new Date(selectedPost.created_at).toLocaleString()}</p>
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
                        <div className="text-gray-200 h-[90%] overflow-y-auto">{selectedPost.description}</div>
                        <div className="flex gap-[1rem]">                            
                            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                                <i 
                                    className={`fa-${userLiked ? 'solid' : 'regular'} fa-heart cursor-pointer ${userLiked ? 'text-red-500' : ''}`} 
                                    onClick={givingLikes}
                                ></i>
                                <span>{likesData.length}</span>
                            </div>
                            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                                <i className="fa-regular fa-comment cursor-pointer" onClick={() => setOpenComments(true)}></i>
                                <span>{commentsData.length}</span>
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
                        comments_data={commentsData}
                    /> 
                : null}
            </div>
        </div>
    );
}