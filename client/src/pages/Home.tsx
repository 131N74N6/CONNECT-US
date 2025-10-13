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
        stale_time: 5000
    });

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            {error ? 
                <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                    <span className="text-[2rem] font-[600] text-purple-700">{error.message}</span>
                </div>
                : isLoading ? 
                    <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-black">
                        <Loading/>
                    </div>
                : data ?
                    <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[300px] w-full bg-[#1a1a1a]">
                        <PostList 
                            data={data}
                            isReachedEnd={isReachedEnd}
                            loadMore={isLoadingMore}
                            setSize={fetchNextPage}
                        />
                    </div>
                : <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
            }
        </section>
    );
}