import { Navbar1, Navbar2 } from "../components/Navbar";
import type { PostItemProps } from "../services/custom-types";
import PostList from "../components/PostList";
import { useRef, useState } from "react";

export default function SearchPost() {
    const [searchedPost, setSearchedPost] = useState<PostItemProps[]>([]);
    const searchRef = useRef<HTMLInputElement>(null);

    const searchPosts = async () => {
            const request = await fetch(`http://localhost:1234/posts/searched`, {
            body: JSON.stringify({ searched: searchRef.current?.value }),
            method: 'POST'
        });

        const response: PostItemProps[] = await request.json();
        setSearchedPost(response);
    }

    return (
        <div className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <Navbar1/>
            <Navbar2/>
            <div className="bg-black flex flex-col gap-[1rem] md:w-3/4 w-full">
                <form onSubmit={searchPosts} className="bg-[#1a1a1a] p-[1rem]">
                    <input 
                        ref={searchRef}
                        placeholder="search here..."
                        type="text" 
                        className="p-[0.45rem] font-[550] text-purple-400 outline-0 border w-full border-purple-400"
                    />
                    <button>Search</button>
                </form>
                <div className="bg-[#1a1a1a] text-purple-400 p-[1rem] h-screen overflow-y-auto">
                    <PostList data={searchedPost}/>
                </div>
            </div>
        </div>
    );
}