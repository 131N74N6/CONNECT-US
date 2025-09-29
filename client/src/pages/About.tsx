import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import useAuth from "../services/useAuth";
import DataModifier from "../services/data-modifier";
import useSWR from "swr";
import Error from "./Error";

export default function About() {
    const { user } = useAuth();
    const { getData } = DataModifier();
    const { data: signedUserPosts, isLoading } = useSWR<PostItemProps[]>(
        user ? `http://localhost:1234/posts/signed-user/${user.info.id}` : null,
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            errorRetryCount: 3
        }
    );

    if (isLoading) return <Loading/>;

    if (signedUserPosts?.length === 0) return <Error message={"No posts found."}/>;

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={signedUserPosts ? signedUserPosts : []}/>
        </div>
    );
}