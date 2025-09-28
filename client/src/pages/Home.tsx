import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import Error from "./Error";
import PostList from "../components/PostList";
import DataModifer from '../services/data-modifier';
import useSWR from 'swr';

export default function Home() {
    const { getData } = DataModifer<PostItemProps>();
    const { data: allPosts, isLoading } = useSWR<PostItemProps[]>(
        `http://localhost:1234/posts/get-all`, 
        getData,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000, // Reduce unnecessary requests
            errorRetryCount: 3,
        }
    );

    if (isLoading) return <Loading />;

    if (allPosts?.length === 0) return <Error message={"No posts found."}/>;

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={allPosts ? allPosts : []}/>
        </div>
    );
}