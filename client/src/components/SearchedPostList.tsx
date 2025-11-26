import type { PostListProps } from "../services/custom-types";
import Loading from "./Loading";
import PostItem from "./PostItem";

export default function SearchedPostList(props: PostListProps) {
    if (!props.data || props.data.length === 0) {
        return (
            <section className="flex h-full items-center justify-center">
                <span className="text-purple-400 font-[600] text-[1rem]">No Post Found</span>
            </section>
        );
    }

    return (
        <section className="bg-[#1a1a1a] gap-[1rem] flex flex-col overflow-y-auto">
            {!props.data ? (<Loading/>) : null}
            <div className="gap-[0.5rem] grid md:grid-cols-3 grid-cols-2">
                {props.data.map((post) => (
                    <PostItem 
                        key={`posts_${post._id}`}
                        _id={post._id} 
                        description={post.description}
                        posts_file={post.posts_file}
                        uploader_name={post.uploader_name}
                        user_id={post.user_id}
                    />
                ))}
            </div>
            <div className="flex justify-center">
                {props.loadMore ? <div className="flex justify-center"><Loading/></div> : null}
                {!props.isReachedEnd ? (
                    <button 
                        type="button"
                        onClick={() => props.setSize()}
                        className="bg-purple-400 text-gray-800 w-[120px] rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem]"
                    >
                        Load More
                    </button>
                ) : props.data.length < 12 ? (
                    <></> 
                ) : (
                    <p className="text-purple-400 font-[500] text-center text-[1rem]">No More Data to Show</p>
                )}
            </div>
        </section>
    );
}