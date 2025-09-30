import type { IFollowers, PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from "../services/data-modifier";
import useSWR from "swr";
import Error from "./Error";
import { useParams } from "react-router-dom";
import useAuth from "../services/useAuth";

export default function About() {
    const { user } = useAuth();
    const { user_id } = useParams();
    const { getData: getSignedUserFollowers } = DataModifier();
    const { getData: getFollowedUserBySignedUser, insertData: startFollow, deleteData: unfollow } = DataModifier();
    const { getData: getSignedUserPosts } = DataModifier();
    
    const { data: signedUserPosts, isLoading } = useSWR<PostItemProps[]>(
        user_id ? `http://localhost:1234/posts/signed-user/${user_id}` : null,
        getSignedUserPosts,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: signedUserFollowers } = useSWR<IFollowers[]>(
        user_id ? `http://localhost:1234/followers/get-all/${user_id}` : null,
        getSignedUserFollowers,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );
    
    const { data: followedUser, mutate: followedUserMutate } = useSWR<IFollowers[]>(
        user_id ? `http://localhost:1234/followers/who-followed/${user_id}` : null,
        getFollowedUserBySignedUser,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const notOwner = user_id && user && user.info.id !== user_id;
    const signedUserHasFollowed = user && followedUser ? followedUser.some(flwd => flwd.user_id === user.info.id) : false;

    const handleFollowBtn = async (): Promise<void> => {
        if (!user_id || !user) return;
        const getCurrentDate = new Date();

        if (!signedUserHasFollowed) {
            await startFollow<IFollowers>({
                api_url: `http://localhost:1234/followers/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    other_user_id: user_id,
                    user_id: user.info.id,
                    username: user.info.username
                }
            });

            followedUserMutate();
        } else {
            await unfollow(`http://localhost:1234/followers/erase/${user.info.id}`);
            followedUserMutate();
        }
    }

    if (isLoading) return <Loading/>;

    if (!signedUserPosts) return <Error message={"No posts found."}/>;

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] w-full bg-[#1a1a1a]">
                {notOwner ? 
                    <button 
                        type="button"
                        onClick={handleFollowBtn} 
                        className={
                            signedUserHasFollowed ? "bg-purple-400 text-[#1a1a1a] font-[500] cursor-pointer text-[0.9rem] p-[0.45rem]" : 
                            "bg-white text-gray-800 font-[500] cursor-pointer text-[0.9rem] p-[0.45rem]"
                        }
                    >
                        {signedUserHasFollowed ? 'Followed' : 'Follow' }
                    </button> 
                : null}
                <ul className="flex justify-evenly">
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Followers</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {signedUserFollowers ? signedUserFollowers.length : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Following</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {followedUser ? followedUser.length : 0}
                        </span>
                    </li>
                    <li className="flex flex-col gap-[0.2rem] text-center">
                        <span className="text-purple-400 font-[500] text-[1rem]">Posts</span>
                        <span className="text-purple-400 font-[500] text-[1rem]">
                            {signedUserPosts ? signedUserPosts.length : 0}
                        </span>
                    </li>
                </ul>
                <PostList data={signedUserPosts ? signedUserPosts : []}/>
            </div>
        </section>
    );
}