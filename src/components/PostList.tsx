import type { PostListProps } from "../services/custom-types";
import PostItem from "./PostItem";

export default function PostList(props: PostListProps) {
    if (props.data.length === 0) {
        <div className="flex justify-center items-center h-screen">
            <span className="text-[2rem] font-[600] text-purple-700">No Post Recently...</span>
        </div>
    }

    return (
        <div className="flex-1 p-[1rem] gap-[1rem] grid grid-cols-3 md:w-3/4 w-full overflow-y-auto">
            {props.data.map((post) => (
                <PostItem key={`post_${post.id}`} id={post.id} image_url={post.image_url}/>
            ))}
        </div>
    );
}