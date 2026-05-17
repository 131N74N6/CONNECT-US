import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import PostList from "../components/PostList";
import PostServices from "../services/post.service";

export default function Home() {
    const { allPosts } = PostServices();

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[200px] w-full bg-[#1a1a1a]">
                {allPosts.allPostError ? (
                    <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">{allPosts.allPostError.message}</span>
                    </div>
                ) : allPosts.allPostsIsLoading ? (
                    <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                        <Loading/>
                    </div> 
                ) : allPosts.allPostsData ? (
                    <PostList 
                        data={allPosts.allPostsData}
                        isReachedEnd={allPosts.allPostsReachedEnd}
                        loadMore={allPosts.allPostsLoadMore}
                        setSize={allPosts.allPostsNextPage}
                    />
                ) : (
                    <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
                        <span className="text-[2rem] font-[600] text-purple-700">Failed to get posts</span>
                    </div>
                )}
            </div>
            <Navbar2/>
        </section>
    );
}