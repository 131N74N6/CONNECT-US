import { Navbar1, Navbar2 } from "../components/Navbar";
import type { PostItemProps } from "../services/custom-types";
import { useEffect, useRef, useState } from "react";
import useDebounce from "../services/useDebounce";

export default function SearchPost() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchedPost, setSearchedPost] = useState<PostItemProps[]>([]);
    const searchRef = useRef<HTMLInputElement>(null);
    const debouncedSearch = useDebounce(searchQuery, 500);

    const searchPosts = async (debouncedSearch: string) => {
        const request = await fetch(`http://localhost:1234/posts/searched`, {
            body: JSON.stringify({ searched: searchRef.current?.value }),
            method: 'POST'
        });

        const response: PostItemProps[] = await request.json();
        setSearchedPost(response);
    }

    useEffect(() => {
        if (debouncedSearch) searchPosts(debouncedSearch);
        else setSearchedPost([]);
    }, [debouncedSearch, searchPosts]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchQuery(value);
    }

    return (
        <div className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <Navbar1/>
            <Navbar2/>
            <div className="bg-black flex flex-col gap-[1rem] md:w-3/4 w-full">
                <form className="bg-[#1a1a1a] p-[1rem]">
                    <input 
                        ref={searchRef}
                        value={searchQuery}
                        placeholder="search here..."
                        onChange={handleInputChange}
                        type="text" 
                        className="p-[0.45rem] font-[550] text-purple-400 outline-0 border w-full border-purple-400"
                    />
                </form>
                <div className="bg-[#1a1a1a] text-purple-400 p-[1rem] h-full overflow-y-auto">
                    {searchedPost.length === 0 ? (                        
                        <div className="h-full flex justify-center items-center">
                            <span className="text-purple-400 font-[500] text-[1.3rem]">No Post Found</span>
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