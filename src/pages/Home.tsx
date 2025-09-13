import { useEffect, useCallback } from 'react';
import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import Error from "./Error";
import { infinteScroll } from "../services/useFirestore";
import PostList from "../components/PostList";

export default function Home() {
    const postCollection = 'posts';

    const { data, loading, hasMore, fetchData } = infinteScroll<PostItemProps>(
        postCollection,
        [],
        [['created_at', 'desc']], 
        10
    );

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500 && hasMore && !loading) {
            fetchData();
        }
    }, [hasMore, loading, fetchData]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    if (data.length === 0 && loading) return <Loading />;

    if (!loading && data.length === 0 && !hasMore) return <Error message={"No posts found."}/>;

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1 />
            <Navbar2 />
            <PostList data={data} />
            {loading ? <Loading /> : null}
        </div>
    );
}