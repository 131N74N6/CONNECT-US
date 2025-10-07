import type { PostListProps } from "../services/custom-types";
import Loading from "./Loading";
import PostItem from "./PostItem";

export default function PostList(props: PostListProps) {
    if (!props.data || props.data.length === 0) {
        return (
             <section className="flex h-full items-center justify-center">
                <span className="text-purple-400 font-[600] text-[1rem]">No post added currently...</span>
            </section>
        );
    }

    return (
        <section className="bg-[#1a1a1a] gap-[1rem] flex flex-col overflow-y-auto">
            {!props.data ? <Loading/> : null}
            <div className="gap-[0.5rem] grid md:grid-cols-3 grid-cols-2">
                {props.data.map((post) => (
                    <PostItem 
                        _id={post._id} 
                        description={post.description}
                        posts_file={post.posts_file}
                        user_id={post.user_id}
                    />
                ))}
            </div>
            <div className="flex justify-center">
                {props.loadMore ? <Loading/> : null}
                {!props.isReachedEnd ? 
                    <button onClick={() => props.setSize(props.size + 1)}>Load More</button> : 
                    <p className="text-purple-400 font-[500] text-center text-[1rem]">No More Data to Show</p>
                }
            </div>
        </section>
    );
}