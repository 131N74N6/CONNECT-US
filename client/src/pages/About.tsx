import type { IFollowers, PostItemProps, IUser } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from "../services/data-modifier";
import useSWR from "swr";
import Error from "./Error";
import { useParams } from "react-router-dom";

export default function About() {
    const { user_id } = useParams();
    const { getData: getAllUsers } = DataModifier();
    const { getData: getSignedUserFollowers } = DataModifier();
    const { getData: getFollowedUserBySignedUser } = DataModifier();
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

    const { data: followedUser } = useSWR<IFollowers[]>(
        user_id ? `http://localhost:1234/followers/who-followed/${user_id}` : null,
        getFollowedUserBySignedUser,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const { data: allUsers } = useSWR<IUser[]>(
        `http://localhost:1234/users/get-all/`,
        getAllUsers,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    const notOwner = user_id && allUsers && allUsers.filter(user => user._id === user_id);

    if (isLoading) return <Loading/>;

    if (signedUserPosts?.length === 0) return <Error message={"No posts found."}/>;

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] w-full bg-[#1a1a1a]">
                {notOwner ? null : <button className="bg-white text-gray-800 font-[500] cursor-pointer text-[0.9rem] p-[0.45rem]">Follow</button>}
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