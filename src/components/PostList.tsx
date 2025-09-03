import type { PostListProps } from "../services/custom-types";
import PostItem from "./PostItem";

export default function PostList(props: PostListProps) {
    if (props.data.length === 0) {
        <div>No Post Recently...</div>
    }

    return (
        <div className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {props.data.map((post) => (
                <PostItem id={post.id} image_url={post.image_url}/>
            ))}
        </div>
    );
}