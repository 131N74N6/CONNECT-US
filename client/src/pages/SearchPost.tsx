import { Navbar1, Navbar2 } from "../components/Navbar";
import { useCallback, useState } from "react";
import useDebounce from "../services/useDebounce";
import FilterHandler from "../services/filter-handler";
import Loading from "../components/Loading";
import SearchedPostList from "../components/SearchedPostList";

export default function SearchPost() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const { searchedPost } =  FilterHandler();
    const { 
        data,
        error,
        fetchNextPage,
        isLoading,
        isLoadingMore,
        isReachedEnd
     } = searchedPost({
        api_url: `http://localhost:1234/posts/searched`,
        limit: 12,
        query_key: [`searched-posts-${debouncedSearch}`],
        searched: debouncedSearch,
        stale_time: 600000
    });

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    }, []);

    return (
        <div className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <Navbar1/>
            <Navbar2/>
            <div className="bg-black flex flex-col gap-[1rem] md:w-3/4 w-full h-[100%]">
                <form className="bg-[#1a1a1a] p-[1rem]">
                    <input 
                        value={searchQuery}
                        placeholder="search here..."
                        onChange={handleInputChange}
                        type="text" 
                        className="p-[0.45rem] font-[550] text-purple-400 outline-0 border w-full border-purple-400"
                    />
                </form>
                <div className="bg-[#1a1a1a] text-purple-400 p-[1rem] h-full overflow-y-auto">
                    {data ? (                        
                        <SearchedPostList 
                            data={data}
                            isReachedEnd={isReachedEnd}
                            loadMore={isLoadingMore}
                            setSize={fetchNextPage}
                        />
                    ) : isLoading ? (
                        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                            <Loading/>
                        </div> 
                    ) : error ? (
                        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                            <span className="text-[2rem] font-[600] text-purple-700">{error.message}</span>
                        </div>
                    ) : (                        
                        <div className="h-full flex justify-center items-center">
                            <span className="text-purple-400 font-[500] text-[1.3rem]">No Post Found</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}