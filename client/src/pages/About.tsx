import type { AddFollowerProps, PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from "../services/data-modifier";
import { Link, useParams } from "react-router-dom";
import useAuth from "../services/useAuth";
import { useEffect, useState } from "react";
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
    } = infiniteScroll<PostItemProps>({
        api_url: `http://localhost:1234/posts/signed-user/${user_id}`, 
        limit: 12,
        query_key: `signed-user-posts_${user_id}`,
        stale_time: 5000
    });

    const { 
        refetch: currentUserFollowerMutate,
        data: paginatedCurrentUserFollower,
        isReachedEnd: currentUserFollowerReachEnd, 
        isLoadingMore: loadCurrentUserFollower, 
        fetchNextPage: setCurrentUserFollower, 
    } = infiniteScroll<AddFollowerProps>({
        api_url: `http://localhost:1234/followers/get-all/${user_id}`, 
        limit: 12,
        query_key: `followers-${user_id}`,
        stale_time: 1000,
    });

    const { 
        refetch: currentUserFollowingMutate,
        data: paginatedCurrentUserFollowing,
        isReachedEnd: currentUserFollowingReachEnd, 
        isLoadingMore: loadCurrentUserFollowing, 
        fetchNextPage: setCurrentUserFollowing, 
    } = infiniteScroll<AddFollowerProps>({
        api_url: `http://localhost:1234/followers/who-followed/${user_id}`, 
        limit: 12,
        query_key: `who-followed/${user_id}`,
        stale_time: 1000,
    });

    const notOwner = user_id && user && user.info.id !== user_id;
    const isFollowed = paginatedCurrentUserFollower && user ? paginatedCurrentUserFollower.some(follow => user.info.id === follow.user_id) : false;

    const insertMutation = useMutation({
        mutationFn: async () => {
            if (!user_id || !user) return;
            
            const getCurrentDate = new Date();

            if (!isFollowed) {
                await insertData<AddFollowerProps>({
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
        },
        onSuccess: () => {
            queryQlient.invalidateQueries({ 
                queryKey: [`followers-${user_id}`, `http://localhost:1234/followers/get-all/${user_id}`, 12] 
            });
            queryQlient.invalidateQueries({ 
                queryKey: [`who-followed-${user_id}`, `http://localhost:1234/followers/who-followed/${user_id}`, 12] 
            });
        }
    });

    const handleFollowBtn = async (): Promise<void> => {
        if (isFollowLoading) return;
        setIsFollowLoading(true);
        try {
            insertMutation.mutate();
            await Promise.all([
                currentUserFollowingMutate(),
                currentUserFollowerMutate()
            ]);
        } catch (error) {
            setError({ isError: true, message: 'Failed to follow' });
        } finally {
            setIsFollowLoading(false);
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
                    setSize={setCurrentUserFollower}
                /> 
            : null}
            {showFollowing ? 
                <FollowingList
                    followed={paginatedCurrentUserFollowing}
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
                {currentUserPostsError ? <span className="text-[2rem] font-[600] text-purple-700">{currentUserPostsError.message}</span>
                    : loadPosts ? <Loading/> 
                    : currentUserPosts ?
                        <PostList 
                            data={currentUserPosts}
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