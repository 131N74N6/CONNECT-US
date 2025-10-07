import type { PostsResponse } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from '../services/data-modifier';
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef } from "react";

export default function Home() {
    const { getData } = DataModifier();
    const observerRef = useRef<IntersectionObserver>();

    const { 
        data: homePosts, 
        error: homePostsError, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        status 
    } = useInfiniteQuery({
        initialPageParam: 1,
        getNextPageParam: (lastPage: PostsResponse) => {
            return lastPage.pagination.has_next_page ? lastPage.pagination.current_page + 1 : undefined;
        },
        queryFn: async ({ pageParam = 1 }): Promise<PostsResponse> => {
            const response = await getData(`http://localhost:1234/posts/get-paginated?page=${pageParam}&limit=6`);
            return response;
        },
        queryKey: ['all-posts'],
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, 
    });

    const getPost = homePosts ? homePosts.pages.flatMap(page => page.data) : [];

    const lastPostRef = (node: HTMLDivElement | null) => {
        if (isFetchingNextPage) return;
        
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
        });
        
        if (node) observerRef.current.observe(node);
    }

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            {status === 'error' ? 
                <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                    <span className="text-[2rem] font-[600] text-purple-700">{homePostsError.message}</span>
                </div>
                : isFetchingNextPage ? 
                    <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                        <Loading/> 
                    </div>
                : status === 'success' ?
                    <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[300px] w-full bg-[#1a1a1a]">
                        <PostList 
                            data={getPost}
                            hasMore={hasNextPage || false}
                            isLoadingMore={isFetchingNextPage || false}
                            lastPostRef={lastPostRef}
                        />
                    </div>
                :
                <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                    <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
                </div>
            }
        </section>
    );
}