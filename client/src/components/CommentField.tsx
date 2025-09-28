import type { CommentProps } from "../services/custom-types";

export default function CommentField(props: CommentProps) {
    return (
        <div className="flex justify-center items-center fixed inset-0 z-20 bg-[rgba(0,0,0,0.66)] p-[0.7rem]">
            <div className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem] border border-purple-400 w-[400px] h-[400px]">
                <div className="flex gap-[0.7rem] justify-between">
                    <span className="text-[1rem] font-[550]">Comments</span>
                    <button onClick={props.onClose} type="button" className="cursor-pointer">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="flex flex-col gap-[1rem]">
                    {props.comments_data.length > 0 ?
                        props.comments_data.map((comment) => (
                            <div className="bg-black p-[0.6rem] rounded-[0.6rem]">
                                <div className="flex justify-between">
                                    <p>{comment.username}</p>
                                    <p className="text-[0.9rem]">{new Date(comment.created_at).toLocaleString()}</p>
                                </div>
                                <h3 className="font-[500]">{comment.opinion}</h3>
                            </div>
                        )) : (
                            <div className="flex justify-center items-center">
                                <span className="text-center font-[550] text-[1.6rem]">No Comments</span>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}