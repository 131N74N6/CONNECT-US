import { useParams, useNavigate } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { infiniteScroll, insertData } from "../services/useFirestore";
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
    
    const { data, loading } = infiniteScroll<NewPost>(
        postCollection,
        id ? [['id', '==', id]] : [],
        []
    );

    const { data: postComment } = infiniteScroll<IComments>(
        commentCollection,
        id ? [['post_id', '==', id]] : [],
        [['created_at', 'desc']],
        12
    );

    const { data: likesData } = infiniteScroll<ILikes>(
        likeCollection,
        id ? [['post_id', '==', id]] : [],
    );

    const post = data && data.length > 0 ? data[0] : null;

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

            await insertData<ILikes>({
                collectionName: likeCollection,
                data: {
                    post_id: id,
                    user_id: user.uid,
                    username: user.displayName
                }
            });
        } catch (error: any) {
            console.log(error.message);
        }
    }

    const handleDeletePost = async () => {
        if (!post || !window.confirm('Are you sure you want to delete this post?')) return;

        try {
            if (post.file_url && post.file_url.length > 0) {
                const deletePromises = post.file_url.map(url => {
                    const parts = url.split('/');
                    const publicId = parts[parts.length - 1].split('.')[0];
                    return deleteFromCloudinary(publicId, url.includes('.mp4') ? 'video' : 'image');
                });

                await Promise.all(deletePromises);
            }

            await deleteData({
                collectionName: postCollection,
                values: post.id
            });

            navigate('/home');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    };

    if (loading) return <Loading />;

    if (!post) return <Error message={'404 | NOT FOUND'} />;

    // Check if the current user is the post owner
    const isPostOwner = user && user.uid === post.user_id;

    // Separate images and videos
    const images = post.file_url?.filter(url => url.match(/\.(jpeg|jpg|gif|png)$/) !== null) || [];

    const videos = post.file_url?.filter(url => url.match(/\.(mp4|webm|ogg)$/) !== null) || [];

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1 />
            <Navbar2 />
            
            <div className="md:w-3/4 w-full flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg overflow-y-auto p-[0.8rem]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            {post.uploader_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 className="font-semibold">{post.uploader_name || 'Unknown User'}</h3>
                            <p className="text-gray-400 text-sm">{new Date(post.created_at).toLocaleString()}</p>
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
                
                <div className="grid md:grid-cols-2 grid-cols-1 gap-[1rem]">
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
                        <div className="text-gray-200 h-[90%] overflow-y-auto">{post.description}</div>
                        <div className="flex gap-[1rem]">                            
                            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                                <i className="fa-regular fa-heart cursor-pointer" onClick={givingLikes}></i>
                                <span>{likesData.length}</span>
                            </div>
                            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                                <i className="fa-regular fa-comment cursor-pointer" onClick={() => setOpenComments(true)}></i>
                                <span>{postComment.length}</span>
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
                        comments_data={postComment}
                    /> 
                : null}
            </div>
        </div>
    );
}