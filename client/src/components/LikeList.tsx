import type { LikeListProps } from "../services/custom-types";
import LikeItem from "./LikeItem";
import Loading from "./Loading";

export default function LikeList(props: LikeListProps) {
    if (props.likes.length === 0) {
        return (
            <section className="flex h-full items-center justify-center">
                <span className="text-purple-400 font-[600] text-[1rem]">No post added currently...</span>
            </section>
        );
    }

    return (
        <div className="bg-[#1a1a1a] gap-[1rem] flex flex-col overflow-y-auto">
            <div className="gap-[0.5rem] flex flex-col">
                {props.likes.map((like) => (
                    <LikeItem 
                        key={`like-data-${like.user_id}`} 
                        created_at={like.created_at}
                        user_id={like.user_id}
                        username={like.username}
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
                ) : props.likes.length < 12 ? (
                    <></> 
                ) : (
                    <p className="text-purple-400 font-[500] text-center text-[1rem]">No More Data to Show</p>
                )}
            </div>
        </div>
    );
}