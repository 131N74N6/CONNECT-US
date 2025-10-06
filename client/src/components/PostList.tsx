import { useEffect, useRef } from "react";
import type { PostListProps } from "../services/custom-types";
import PostItem from "./PostItem";

export default function PostList(props: PostListProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = () => {
        if (props.hasMore && !props.isLoadingMore) props.onLoadMore();
    }

    useEffect(() => {
        if (!props.hasMore || props.isLoadingMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) handleLoadMore();
            },
            { threshold: 0.1 }
        );

        const currentTrigger = loadMoreTriggerRef.current;
        if (currentTrigger) observerRef.current.observe(currentTrigger);

        return () => {
            if (observerRef.current && currentTrigger) observerRef.current.unobserve(currentTrigger);
        }
    }, [props.hasMore, props.isLoadingMore, handleLoadMore]);
    
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
            <div ref={loadMoreTriggerRef} className="flex justify-center py-4">
                {props.isLoadingMore ? (
                    <div className="text-purple-400">Loading more posts...</div>
                ) : null}
                {!props.hasMore && props.data.length > 0 ? (
                    <div className="text-gray-400">No more posts to load</div>
                ) : null}
            </div>
        </section>
    );
}