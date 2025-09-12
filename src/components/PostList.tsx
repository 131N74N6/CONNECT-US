import type { PostListProps } from "../services/custom-types";
import PostItem from "./PostItem";

export default function PostList(props: PostListProps) {
    if (!props.data || props.data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="text-[1.5rem] font-[600] text-purple-400">No Posts Found</span>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] p-[1rem] gap-[0.5rem] grid grid-cols-3 md:w-3/4 w-full overflow-y-auto">
            {props.data.map((post) => (
                <PostItem 
                    key={`post_${post.id}`} 
                    id={post.id} 
                    created_at={post.created_at}
                    file_url={post.file_url}
                    description={post.description}
                    user_id={post.user_id}
                />
            ))}
        </div>
    );
}