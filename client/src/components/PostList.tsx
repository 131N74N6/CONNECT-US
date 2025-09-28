import type { PostListProps } from "../services/custom-types";
import PostItem from "./PostItem";
import LoadScroll from '../components/LoadScroll';

export default function PostList(props: PostListProps) {
    if (!props.data || props.data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="text-[1.5rem] font-[600] text-purple-400">No Posts Found</span>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1a1a] p-[1rem] flex flex-col md:w-3/4 w-full overflow-y-auto">
            <div className="gap-[0.5rem] grid grid-cols-3">
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
            <div>
                {props.has_more && props.data.length > 0 ? <LoadScroll/> : 
                <div className="text-center text-gray-400 pt-[0.5rem] w-full">
                    <span className="text-center">No more posts to load</span>
                </div>}
            </div>
        </div>
    );
}