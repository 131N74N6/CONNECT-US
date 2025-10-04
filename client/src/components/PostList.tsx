import type { PostListProps } from "../services/custom-types";
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
            <div className="gap-[0.5rem] grid grid-cols-3">
                {props.data.map((post) => (
                    <PostItem 
                        key={`post_${post._id}`} 
                        _id={post._id} 
                        description={post.description}
                        posts_file={post.posts_file}
                        user_id={post.user_id}
                    />
                ))}
            </div>
        </section>
    );
}