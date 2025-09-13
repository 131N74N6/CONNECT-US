import { useParams, useNavigate } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { infinteScroll } from "../services/useFirestore";
import { deleteData } from "../services/useFirestore";
import useAuth from "../services/useAuth";
import type { NewPost } from "../services/custom-types";
import Loading from "../components/Loading";
import Error from "./Error";
import PostSlider from "../components/PostSlider";
import { deleteFromCloudinary } from "../services/useFileStorage";

export default function PostDetail() {
    const postCollection = 'posts';
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { data, loading } = infinteScroll<NewPost>(
        postCollection,
        id ? [['id', '==', id]] : [],
        []
    );

    const post = data && data.length > 0 ? data[0] : null;

    const handleDeletePost = async () => {
        if (!post || !window.confirm('Are you sure you want to delete this post?')) return;

        try {
            // Delete media files from Cloudinary first
            if (post.file_url && post.file_url.length > 0) {
                const deletePromises = post.file_url.map(url => {
                    // Extract public ID from Cloudinary URL
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
        <div className="flex gap-[1rem] md:flex-row flex-col min-h-screen p-[1rem] bg-black text-white">
            <Navbar1 />
            <Navbar2 />
            
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
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
                    
                    {post.description ? <div className="text-gray-200">{post.description}</div> : null}
                    
                    <div className="space-y-4">
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
                    </div>
                    
                    <div className="flex gap-[1rem] pt-[1rem]">                            
                        <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                            <i className="fa-regular fa-heart cursor-pointer"></i>
                            <span>0</span>
                        </div>
                        <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                            <i className="fa-regular fa-comment cursor-pointer"></i>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}