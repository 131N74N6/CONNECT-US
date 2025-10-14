import type { AddFollowerProps, FollowedResponseProps, FollowersResponseProps, PostResponseProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from "../services/data-modifier";
import { Link, useParams } from "react-router-dom";
import useAuth from "../services/useAuth";
import { useEffect, useMemo, useState } from "react";
import Notification from "../components/Notification";
import { FollowerList, FollowingList } from "../components/FollowList";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function About() {
    const { user } = useAuth();
    const queryQlient = useQueryClient();
    const { user_id } = useParams();
    const { infiniteScroll, insertData, deleteData } = DataModifier();
    const [error, setError] = useState({ isError: false, message: '' });
    const [showFollowers, setShowFollowers] = useState<boolean>(false);
    const [showFollowing, setShowFollowing] = useState<boolean>(false);
    const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
    
    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const { 
        error: currentUserPostsError,
        data: currentUserPosts, 
        isLoading: loadPosts, 
        isReachedEnd: postReachEnd, 
        isLoadingMore: loadPostOwner, 
        fetchNextPage: setCurrentUserPosts, 
    } = infiniteScroll<PostResponseProps>({
        api_url: `http://localhost:1234/posts/signed-user/${user_id}`, 
        limit: 12,
        query_key: `signed-user-posts_${user_id}`,
        stale_time: 1000
    });

    const { 
        data: currentUserFollowers,
        isReachedEnd: currentUserFollowerReachEnd, 
        isLoadingMore: loadCurrentUserFollower, 
        fetchNextPage: setCurrentUserFollower, 
    } = infiniteScroll<FollowersResponseProps>({
        api_url: `http://localhost:1234/followers/get-all/${user_id}`, 
        limit: 12,
        query_key: `followers-${user_id}`,
        stale_time: 1000,
    });

    const { 
        data: currentUserFollowed,
        isReachedEnd: currentUserFollowingReachEnd, 
        isLoadingMore: loadCurrentUserFollowing, 
        fetchNextPage: setCurrentUserFollowing, 
    } = infiniteScroll<FollowedResponseProps>({
        api_url: `http://localhost:1234/followers/who-followed/${user_id}`, 
        limit: 12,
        query_key: `who-followed/${user_id}`,
        stale_time: 1000,
    });

    const getFollowers = useMemo(() => {
        if (!currentUserFollowers) return [];
        return currentUserFollowers.flatMap(page => page.followers);
    }, [currentUserFollowers]);

    const getPostOwnerName = useMemo(() => {
        if (!currentUserFollowers) return [];
        return currentUserFollowers.flatMap(page => page.followers);
    }, [currentUserFollowers]);

    const followersTotal = useMemo(() => {
        if (currentUserFollowers.length === 0) return 0;
        return currentUserFollowers[0].follower_total;
    }, [currentUserFollowers]);

    const currentUserPostTotal = useMemo(() => {
        if (currentUserPosts.length === 0) return 0;
        return currentUserPosts[0].total_post;
    }, [currentUserPosts]);

    const followedTotal = useMemo(() => {
        if (currentUserFollowed.length === 0) return 0;
        return currentUserFollowed[0].followed_total;
    }, [currentUserFollowed]);

    const notOwner = user_id && user && user.info.id !== user_id;
    const isFollowed = getFollowers && user ? getFollowers.some(follow => user.info.id === follow.user_id) : false;

    const insertMutation = useMutation({
        onMutate: () => {
            if (isFollowLoading) return;
            setIsFollowLoading(true);
        },
        mutationFn: async () => {
            if (!user_id || !user) return;
            
            const getCurrentDate = new Date();

            if (!isFollowed) {
                await insertData<AddFollowerProps>({
                    api_url: `http://localhost:1234/followers/add`,
                    data: {
                        created_at: getCurrentDate.toISOString(),
                        followed_user_id: user_id,
                        followed_username: getPostOwnerName[0].username,
                        user_id: user.info.id,
                        username: user.info.username
                    }
                });
            } else {
                await deleteData(`http://localhost:1234/followers/erase/${user.info.id}`);
            }
        },
        onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: [`followers-${user_id}`] });
            queryQlient.invalidateQueries({ queryKey: [`who-followed-${user_id}`] });
        },
        onError: () => setError({ isError: true, message: 'Failed to follow' }),
        onSettled: () => setIsFollowLoading(false)
    });

    const handleFollowBtn = async (): Promise<void> => {
        insertMutation.mutate();
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
                    followers={currentUserFollowers[0].followers}
                    isReachedEnd={currentUserFollowerReachEnd}
                    loadMore={loadCurrentUserFollower || false}
                    onClose={setShowFollowers}
                    setSize={setCurrentUserFollower}
                /> 
            : null}
            {showFollowing ? 
                <FollowingList
                    followed={currentUserFollowed[0].followed}
                    isReachedEnd={currentUserFollowingReachEnd}
                    loadMore={loadCurrentUserFollowing || false}
                    onClose={setShowFollowing}
                    setSize={setCurrentUserFollowing}
                /> 
            : null}
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[300px] w-full bg-[#1a1a1a]">
                <div>
                    {notOwner ? (
                        <button 
                            type="button"
                            disabled={isFollowLoading}
                            onClick={handleFollowBtn} 
                            className={
                                isFollowed ? "bg-purple-400 text-[#1a1a1a] font-[500] w-[120px] cursor-pointer text-[0.9rem] p-[0.45rem] disabled:cursor-not-allowed disabled:opacity-50" : 
                                "bg-yellow-300 text-gray-800 font-[500] cursor-pointer w-[120px] text-[0.9rem] p-[0.45rem] disabled:cursor-not-allowed disabled:opacity-50"
                            }
                        >
                            {isFollowLoading ? 'loading...' : isFollowed ? 'Following' : 'Follow'}
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
                            {followersTotal}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem] cursor-pointer" onClick={() => setShowFollowing(true)}>Following</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {followedTotal}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Posts</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {currentUserPostTotal}
                        </span>
                    </li>
                </ul>
                {currentUserPostsError ? <span className="text-[2rem] font-[600] text-purple-700">{currentUserPostsError.message}</span>
                    : loadPosts ? <Loading/> 
                    : currentUserPosts ?
                        <PostList 
                            data={currentUserPosts[0].posts}
                            loadMore={loadPostOwner}
                            isReachedEnd={postReachEnd}
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