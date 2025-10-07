import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import DataModifier from '../services/data-modifier';

export default function Home() {
    const { infiniteScrollPagination } = DataModifier();
    const { 
        error, 
        getPaginatedData, 
        isLoading, 
        isReachedEnd, 
        loadMore, 
        setSize, 
        size 
    } = infiniteScrollPagination<PostItemProps>(`http://localhost:1234/posts/get-all`, 6);

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            {error ? 
                <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                    <span className="text-[2rem] font-[600] text-purple-700">{error.message}</span>
                </div>
                : isLoading ? 
                    <div className="md:w-3/4 w-full flex justify-center items-center h-full bg-[#1a1a1a]">
                        <Loading/> 
                    </div>
                : getPaginatedData ?
                    <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[300px] w-full bg-[#1a1a1a]">
                        <PostList 
                            data={getPaginatedData}
                            isReachedEnd={isReachedEnd || false}
                            loadMore={loadMore || false}
                            size={size}
                            setSize={setSize}
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