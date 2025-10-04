import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from '../services/data-modifier';
import useSWR from 'swr';
import Error from "./Error";

export default function Home() {
    const { getData } = DataModifier();
    const { data: allPosts, isLoading, error } = useSWR<PostItemProps[]>(
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

    if (error) return <Error message="FAILED TO GET POST"/>

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] w-full bg-[#1a1a1a]">
                <PostList data={allPosts ? allPosts : []}/>
            </div>
        </section>
    );
}