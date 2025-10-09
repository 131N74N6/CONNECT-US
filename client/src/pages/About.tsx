import type { IFollowers, PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from "../services/data-modifier";
import { Link, useParams } from "react-router-dom";
import useAuth from "../services/useAuth";
import { useEffect, useState } from "react";
import Notification from "../components/Notification";
import { FollowerList, FollowingList } from "../components/FollowList";

export default function About() {
    const { user } = useAuth();
    const { user_id } = useParams();
    const { infiniteScrollPagination, insertData, deleteData } = DataModifier();
    const [error, setError] = useState({ isError: false, message: '' });
    const [showFollowers, setShowFollowers] = useState<boolean>(false);
    const [showFollowing, setShowFollowing] = useState<boolean>(false);
    
    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const { 
        error: postOwnerError,
        getPaginatedData: currentUserPosts, 
        isLoading: loadPosts, 
        isReachedEnd: postReachEnd, 
        loadMore: loadPostOwner, 
        setSize: setCurrentUserPosts, 
        size: currentUserPostsSize 
    } = infiniteScrollPagination<PostItemProps>(`http://localhost:1234/posts/signed-user/${user_id}`, 12);

    const { 
        mutate: currentUserFollowerMutate,
        getPaginatedData: paginatedCurrentUserFollower,
        isReachedEnd: currentUserFollowerReachEnd, 
        loadMore: loadCurrentUserFollower, 
        setSize: setCurrentUserFollower, 
        size: currentUserFollowerSize 
    } = infiniteScrollPagination<IFollowers>(`http://localhost:1234/followers/get-all/${user_id}`, 12);

    const { 
        mutate: currentUserFollowingMutate,
        getPaginatedData: paginatedCurrentUserFollowing,
        isReachedEnd: currentUserFollowingReachEnd, 
        loadMore: loadCurrentUserFollowing, 
        setSize: setCurrentUserFollowing, 
        size: currentUserFollowingSize 
    } = infiniteScrollPagination<IFollowers>(`http://localhost:1234/followers/who-followed/${user_id}`, 12);

    const notOwner = user_id && user && user.info.id !== user_id;
    const isFollowed = paginatedCurrentUserFollower && user ? paginatedCurrentUserFollower.some(follow => user.info.id === follow.user_id) : false;

    const handleFollowBtn = async (): Promise<void> => {
        try {
            if (!user_id || !user) return;
            const getCurrentDate = new Date();

            if (!isFollowed) {
                await insertData<IFollowers>({
                    api_url: `http://localhost:1234/followers/add`,
                    data: {
                        created_at: getCurrentDate.toISOString(),
                        followed_user_id: user_id,
                        followed_username: currentUserPosts[0].uploader_name,
                        user_id: user.info.id,
                        username: user.info.username
                    }
                });
            } else {
                await deleteData(`http://localhost:1234/followers/erase/${user.info.id}`);
            }

            currentUserFollowingMutate();
            currentUserFollowerMutate();
        } catch (error) {
            setError({ isError: true, message: 'Failed to follow' });
        }
    }

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black relative z-10">
            <Navbar1/>
            <Navbar2/>
            {error.isError ? 
                <Notification
                    class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] h-[88px] absolute top-[5%] left-[50%] right-[50%]"
                    message={error.message}
                /> 
            : null}
            {showFollowers ? 
                <FollowerList
                    followers={paginatedCurrentUserFollower}
                    isReachedEnd={currentUserFollowerReachEnd}
                    loadMore={loadCurrentUserFollower || false}
                    onClose={setShowFollowers}
                    size={currentUserFollowerSize}
                    setSize={setCurrentUserFollower}
                /> 
            : null}
            {showFollowing ? 
                <FollowingList
                    following={paginatedCurrentUserFollowing}
                    isReachedEnd={currentUserFollowingReachEnd}
                    loadMore={loadCurrentUserFollowing || false}
                    onClose={setShowFollowing}
                    size={currentUserFollowingSize}
                    setSize={setCurrentUserFollowing}
                /> 
            : null}
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[300px] w-full bg-[#1a1a1a]">
                <div>
                    {notOwner ? (
                        <button 
                            type="button"
                            onClick={handleFollowBtn} 
                            className={
                                isFollowed ? "bg-purple-400 text-[#1a1a1a] font-[500] w-[120px] cursor-pointer text-[0.9rem] p-[0.45rem]" : 
                                "bg-yellow-300 text-gray-800 font-[500] cursor-pointer w-[120px] text-[0.9rem] p-[0.45rem]"
                            }
                        >
                            {isFollowed ? 'Following' : 'Follow' }
                        </button> 
                    ) : (
                        <Link to={user ? `/setting/${user.info.id}` : '/home'}>
                            <div className="bg-purple-400 cursor-pointer w-[88px] text-[0.9rem] p-[0.3rem] text-center text-[#1a1a1a] font-[500]">
                                Setting
                            </div>
                        </Link>
                    )}
                </div>
                <ul className="flex justify-evenly border-b border-purple-400 pb-[0.45rem]">
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem] cursor-pointer" onClick={() => setShowFollowers(true)}>Followers</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {paginatedCurrentUserFollower ? paginatedCurrentUserFollower.length : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem] cursor-pointer" onClick={() => setShowFollowing(true)}>Following</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {paginatedCurrentUserFollowing ? paginatedCurrentUserFollowing.length : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Posts</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {currentUserPosts ? currentUserPosts.length : 0}
                        </span>
                    </li>
                </ul>
                {postOwnerError ? <span className="text-[2rem] font-[600] text-purple-700">{postOwnerError}</span>
                    : loadPosts ? <Loading/> 
                    : currentUserPosts ?
                        <PostList 
                            data={currentUserPosts}
                            loadMore={loadPostOwner || false}
                            isReachedEnd={postReachEnd || false}
                            size={currentUserPostsSize}
                            setSize={setCurrentUserPosts}
                        />
                    :
                    <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
                    </div>
                }
            </div>
        </section>
    );
}