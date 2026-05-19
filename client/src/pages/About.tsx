import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Notification from "../components/Notification";
import PostServices from "../services/post.service";
import FollowerServices from "../services/follower.service";

export default function About() {
    const { user_id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!user_id) navigate('/home');
    }, [user_id, navigate]);

    const { currentUserId, error, userPostTotal, setError, allCurrentUserPosts } = PostServices({ user_id: user_id });
    const { isFollowed, isProcessing, notOwner, startFollowMutation, stopFollowMutation, userConnectionStats } = FollowerServices(user_id);

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    function handleFollowBtn() {
        if (isProcessing) return;
        if (!isFollowed) startFollowMutation.mutate();
        else stopFollowMutation.mutate();
    }

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black relative z-10">
            <Navbar1/>
            {error ? 
                <Notification
                    class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] h-[88px] absolute top-[5%] left-[50%] right-[50%]"
                    message={error}
                /> 
            : null}
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[300px] w-full bg-[#1a1a1a]">
                <div>
                    {notOwner ? (
                        <button 
                            type="button"
                            disabled={isProcessing}
                            onClick={handleFollowBtn} 
                            className={
                                isFollowed ? "bg-purple-400 text-[#1a1a1a] font-[500] w-[120px] cursor-pointer text-[0.9rem] p-[0.45rem] disabled:cursor-not-allowed disabled:opacity-50" : 
                                "bg-yellow-300 text-gray-800 font-[500] cursor-pointer w-[120px] text-[0.9rem] p-[0.45rem] disabled:cursor-not-allowed disabled:opacity-50"
                            }
                        >
                            {isProcessing ? 'loading...' : isFollowed ? 'Following' : 'Follow'}
                        </button> 
                    ) : (
                        <Link to={currentUserId ? `/setting/${currentUserId}` : '/home'}>
                            <div className="bg-purple-400 cursor-pointer w-[88px] text-[0.9rem] p-[0.3rem] text-center text-[#1a1a1a] font-[500]">
                                Setting
                            </div>
                        </Link>
                    )}
                </div>
                <ul className="flex justify-evenly border-b border-purple-400 pb-[0.45rem]">
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <Link to={`/followers/${user_id}`} className="text-purple-400 font-[500] text-[1rem] cursor-pointer">Followers</Link>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {userConnectionStats ? userConnectionStats.follower_total : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <Link to={`/followed/${user_id}`} className="text-purple-400 font-[500] text-[1rem] cursor-pointer">Following</Link>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {userConnectionStats ? userConnectionStats.followed_total : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Posts</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {userPostTotal ? userPostTotal : 0}
                        </span>
                    </li>
                </ul>
                {allCurrentUserPosts.currentUserPostsError ? (
                    <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">{allCurrentUserPosts.currentUserPostsError.message}</span>
                    </div>
                ) : allCurrentUserPosts.loadPosts ? (
                    <div className="flex justify-center items-center h-full">
                        <Loading/>
                    </div> 
                ) : allCurrentUserPosts.currentUserPosts ? (
                    <PostList 
                        data={allCurrentUserPosts.currentUserPosts}
                        loadMore={allCurrentUserPosts.loadPostOwner}
                        isReachedEnd={allCurrentUserPosts.postReachEnd}
                        setSize={allCurrentUserPosts.setCurrentUserPosts}
                    />
                ) : (
                    <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
                    </div>
                )}
            </div>
            <Navbar2/>
        </section>
    );
}