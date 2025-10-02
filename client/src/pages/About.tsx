import type { IFollowers, PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from "../services/data-modifier";
import useSWR from "swr";
import Error from "./Error";
import { Link, useParams } from "react-router-dom";
import useAuth from "../services/useAuth";

export default function About() {
    const { user } = useAuth();
    const { user_id } = useParams();
    const { getData, insertData, deleteData } = DataModifier();
    
    const { data: currentUserPost, isLoading } = useSWR<PostItemProps[]>(
        user_id ? `http://localhost:1234/posts/signed-user/${user_id}` : '',
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: currentUserFollower, mutate: currentUserFollowerMutate } = useSWR<IFollowers[]>(
        user_id ? `http://localhost:1234/followers/get-all/${user_id}` : '',
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );
    
    const { data: currentUserFollowing, mutate: currentUserFollowingMutate } = useSWR<IFollowers[]>(
        user_id ? `http://localhost:1234/followers/who-followed/${user_id}` : '',
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const notOwner = user_id && user && user.info.id !== user_id;
    const isFollowed = currentUserFollower && user ? currentUserFollower.some(follow => user.info.id === follow.user_id) : false;

    const handleFollowBtn = async (): Promise<void> => {
        if (!user_id || !user) return;
        const getCurrentDate = new Date();

        if (!isFollowed) {
            await insertData<IFollowers>({
                api_url: `http://localhost:1234/followers/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    other_user_id: user_id,
                    user_id: user.info.id,
                    username: user.info.username
                }
            });
        } else {
            await deleteData(`http://localhost:1234/followers/erase/${user.info.id}`);
        }

        currentUserFollowingMutate();
        currentUserFollowerMutate();
    }

    if (isLoading) return <Loading/>;

    if (!currentUserPost) return <Error message={"No posts found."}/>;

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] w-full bg-[#1a1a1a]">
                <div>
                    {notOwner ? (
                        <button 
                            type="button"
                            onClick={handleFollowBtn} 
                            className={
                                isFollowed ? "bg-purple-400 text-[#1a1a1a] font-[500] cursor-pointer text-[0.9rem] p-[0.45rem]" : 
                                "bg-yellow-300 text-gray-800 font-[500] cursor-pointer text-[0.9rem] p-[0.45rem]"
                            }
                        >
                            {isFollowed ? 'Following' : 'Follow' }
                        </button> 
                    ) : (
                        <Link 
                            to={user ? `/setting/${user.info.id}` : '/home'} 
                            className="bg-purple-400 text-[#1a1a1a] font-[500] cursor-pointer text-[0.9rem] p-[0.45rem]"
                        >
                            Setting
                        </Link>
                    )}
                </div>
                <ul className="flex justify-evenly border-b border-purple-400 pb-[0.45rem]">
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Followers</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {currentUserFollower ? currentUserFollower.length : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Following</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {currentUserFollowing ? currentUserFollowing.length : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Posts</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {currentUserPost ? currentUserPost.length : 0}
                        </span>
                    </li>
                </ul>
                <PostList data={currentUserPost ? currentUserPost : []}/>
            </div>
        </section>
    );
}