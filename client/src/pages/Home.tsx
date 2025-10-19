import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from '../services/data-modifier';

export default function Home() {
    const { infiniteScroll } = DataModifier();
    const { 
        error, 
        data, 
        isLoading, 
        isReachedEnd, 
        isLoadingMore, 
        fetchNextPage
    } = infiniteScroll<PostItemProps>({
        api_url: `http://localhost:1234/posts/get-all`, 
        limit: 12,
        query_key: 'all-posts',
        stale_time: 1000
    });

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[200px] w-full bg-[#1a1a1a]">
                {error ? (
                    <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">{error.message}</span>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loading/>
                    </div> 
                ) : data ? (
                    <PostList 
                        data={data}
                        isReachedEnd={isReachedEnd}
                        loadMore={isLoadingMore}
                        setSize={fetchNextPage}
                    />
                ) : (
                    <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
                    </div>
                )}
            </div>
        </section>
    );
}