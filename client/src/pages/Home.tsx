import type { PostItemProps, PostsResponse } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from '../services/data-modifier';
import useSWRInfinite from "swr/infinite";
import { useMemo } from "react";

export default function Home() {
    const postsLimit = 15;
    const { getData } = DataModifier();

    const getKey = (pageIndex: number, previousPageData: PostsResponse | null) => {
        if (previousPageData && !previousPageData.pagination.has_next_page) return null;
        if (pageIndex === 0) return `http://localhost:1234/posts/get-all?page=1&limit=${postsLimit}`;
        return `http://localhost:1234/posts/get-all?page=${pageIndex + 1}&limit=${postsLimit}`;
    }

    const { data: response, isLoading, error, size, setSize } = useSWRInfinite<PostsResponse>(getKey, getData, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000, // Reduce unnecessary requests
        errorRetryCount: 3,
    });

    const allPosts: PostItemProps[] | undefined = useMemo(() => {
        if (!response) return;
        return response.flatMap(page => page.data);
    }, [response]);

    const hasMore: boolean | undefined = useMemo(() => {
        if (!response) return;
        if (!response[response.length - 1].pagination.has_next_page) return false;
        return true;
    }, [response]);

    const isLoadingMore = isLoading || (size > 0 && response && typeof response[size - 1] === 'undefined');

    const loadMore = () => {
        if (hasMore && !isLoadingMore) setSize(size + 1);
    }

    if (isLoading) return <Loading/>;

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] w-full bg-[#1a1a1a]">
                {error ? (
                    <div className="flex justify-center items-center h-[100%]">
                        <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
                    </div>
                ) : (
                    <PostList 
                        data={allPosts ? allPosts : []}
                        hasMore={hasMore || false}
                        isLoadingMore={isLoadingMore || false}
                        onLoadMore={loadMore}
                    />
                )}
            </div>
        </section>
    );
}