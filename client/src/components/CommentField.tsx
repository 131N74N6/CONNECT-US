import type { CommentProps } from "../services/custom-types";
import Loading from "./Loading";

export default function CommentField(props: CommentProps) {
    return (
        <section className="flex justify-center items-center fixed inset-0 z-20 bg-[rgba(0,0,0,0.66)] p-[0.7rem]">
            <div className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem] border border-purple-400 w-[450px] h-[600px]">
                <div className="flex flex-col gap-[1rem] border-b border-purple-400 h-[79%] overflow-y-auto">
                    {props.comments_data.length > 0 ?
                        props.comments_data.map((comment) => (
                            <div className="bg-black p-[0.6rem] rounded-[0.6rem]" key={`cmt: ${comment._id}`}>
                                <div className="flex justify-between">
                                    <p>{comment.username}</p>
                                    <p className="text-[0.9rem]">{new Date(comment.created_at).toLocaleString()}</p>
                                </div>
                                <h3 className="font-[500]">{comment.opinions}</h3>
                            </div>
                        )) : (
                            <div className="flex justify-center items-center h-full">
                                <span className="text-center font-[550] text-[1.6rem]">No Comments</span>
                            </div>
                        )
                    }
                    {props.loadMore ? <Loading/> : null}
                    {props.isReachedEnd ? (
                        <div className="text-center">
                            <span>No Comments to Load</span>
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={() => props.setSize()}
                            className="bg-pink-300 text-gray-800 w-[120px] rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem]"
                        >
                            Load More
                        </button>
                    )}
                </div>
                <form className="flex flex-col gap-[1rem] h-[21%]" onSubmit={props.sendComment}>
                    <textarea 
                        value={props.comment}
                        placeholder="Write your comment here"
                        name="your opinion"
                        id="your opinion"
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => props.setComment(event.target.value)}
                        className="resize-none w-full text-purple-400 outline-0 h-full border-purple-400 border p-[0.3rem]"
                    ></textarea>
                    <div className="grid grid-cols-2 gap-[0.4rem]">
                        <button 
                            type="submit" 
                            disabled={!props.comment}
                            className="cursor-pointer bg-purple-400 p-[0.45rem] rounded-[0.45rem] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="text-[1rem] font-[550] text-black">Send</span>
                        </button>
                        <button 
                            onClick={() => props.onClose(false)} 
                            type="button" 
                            className="cursor-pointer bg-purple-400 p-[0.45rem] rounded-[0.45rem] text-gray-900"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}