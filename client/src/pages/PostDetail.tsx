import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { IComments, ILikes, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import Error from "./Error";
import ImageSlider from "../components/ImageSlider";
import { useEffect, useState } from "react";
import CommentField from "../components/CommentField";
import useSWR from "swr";
import LikeField from "../components/LikeField";
import VideoSlider from "../components/VideoSlider";
import Notification from "../components/Notification";

export default function PostDetail() {
    const { _id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [comment, setComment] = useState<string>('');
    const [openComments, setOpenComments] = useState<boolean>(false);
    const { deleteData, getData, insertData } = DataModifier();
    const [error, setError] = useState({ isError: false, message: '' });

    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const { data: selectedPost, isLoading: postLoading, mutate: mutatePost } = useSWR<PostDetail[]>(
        _id ? `http://localhost:1234/posts/selected/${_id}` : '',
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: likesData, mutate: likeMutate } = useSWR<ILikes[]>(
        _id ? `http://localhost:1234/likes/get-all/${_id}` : '',
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: commentsData, mutate: commentMutate } = useSWR<IComments[]>(
        _id ? `http://localhost:1234/comments/get-all/${_id}` : '',
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const userLiked = _id && likesData && user ? likesData.find(like => like.user_id === user.info.id && like.post_id === _id) : false;

    async function sendComment(event: React.FormEvent) {
        event.preventDefault();
        const getCurrentDate = new Date();

        try {    
            if (!user || !selectedPost) throw 'Invalid user data';
            if (!_id) throw 'Failed to get post';
            if (!comment.trim()) throw 'Missing required data';

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

            commentMutate();
        } catch (error: any) {
            setError({ isError: true, message: error.message });
        } finally {
            setComment('');
        }
    }
    
    async function givingLikes() {
        const getCurrentDate = new Date();
        try {
            if (!user || !likesData || !_id || !selectedPost) return;

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
            likeMutate();
        } catch (error: any) {
            setError({ isError: true, message: 'Failed to give like' });
        }
    }

    const handleDeletePost = async () => {
        if (!_id) return;
        if (!selectedPost || !window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await deleteData(`http://localhost:1234/posts/erase/${_id}`);
            mutatePost();
            navigate('/home');
        } catch (error) {
            setError({ isError: true, message: 'Failed to delete post.' });
        }
    };

    if (postLoading) return <Loading />;

    if (!selectedPost) return <Error message={'404 | NOT FOUND'} />;

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
            {error.isError ? 
                <Notification
                    class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] h-[88px] absolute top-[5%] left-[50%] right-[50%]"
                    message={error.message}
                /> 
            : null}
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
                    {images.length > 0 ? <ImageSlider images={images} /> : null}
                    {videos.length > 0 ? <VideoSlider videos={videos}/> : null}
            
                    <LikeField
                        commentsData={commentsData}
                        givingLikes={givingLikes}
                        likesData={likesData}
                        setOpenComments={setOpenComments}
                        userLiked={userLiked}
                    />
                    <div className="text-gray-200">{selectedPost[0].description}</div>
                </div>

                {openComments ? 
                    <CommentField 
                        onClose={() => setOpenComments(false)} 
                        comments_data={commentsData ? commentsData : []}
                        comment={comment}
                        setComment={setComment}
                        sendComment={sendComment}
                    /> 
                : null}
            </div>
        </div>
    );
}