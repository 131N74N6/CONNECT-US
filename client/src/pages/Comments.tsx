import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import CommentServices from "../services/comment.service";
import PostServices from "../services/post.service";
import { useEffect } from "react";

export default function Comments() {
    const { _id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!_id) navigate('/home');
    }, [_id, navigate]);

    const { selectedPostData } = PostServices({ id: _id });
    const { allCommentsData, comment, commentMutation, isProcessing, setComment } = CommentServices(_id!);

    function sendComment(event: React.FormEvent): void {
        event.preventDefault();
        commentMutation.mutate(selectedPostData.selectedPost);
    }
    
    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <div className="w-full h-full flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg p-[0.8rem]">
                <div className="flex flex-col gap-[1rem] pb-[1rem] border-b border-purple-400 h-[80%] overflow-y-auto">
                    <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                        {allCommentsData.commentsData.length > 0 ?
                            allCommentsData.commentsData.map((comment, index) => (
                                <div className="bg-black flex flex-col gap-[0.6rem] p-[1rem] rounded-[0.6rem]" key={`cmt: ${index}`}>
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
                    </div>
                    {allCommentsData.loadMoreComments ? <div className="flex justify-center"><Loading/></div> : null}
                    {allCommentsData.commentsData.length < 12 ? (
                        <></>
                    ) : allCommentsData.commentsReachedEnd ? (
                        <div className="text-center">
                            <span>No Comments to Load</span>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button 
                                type="button"
                                onClick={() => allCommentsData.fetchMoreComments()}
                                className="bg-pink-300 text-gray-800 w-[120px] rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem]"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
                <form className="flex flex-col gap-[1rem] h-[20%]" onSubmit={sendComment}>
                    <textarea 
                        value={comment}
                        placeholder="Write your comment here"
                        name="your opinion"
                        id="your opinion"
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setComment(event.target.value)}
                        className="resize-none w-full text-purple-400 outline-0 h-full border-purple-400 border p-[0.3rem]"
                    ></textarea>
                    <div className="grid grid-cols-2 gap-[0.4rem]">
                        <button 
                            type="submit" 
                            disabled={!comment || isProcessing}
                            className="cursor-pointer bg-purple-400 p-[0.45rem] rounded-[0.45rem] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="text-[1rem] font-[550] text-black">Send</span>
                        </button>
                        <Link 
                            to={`/post/${_id}`}
                            className="cursor-pointer bg-purple-400 p-[0.45rem] rounded-[0.45rem] text-center"
                        >
                            <span className="text-[1rem] font-[550] text-black">Back</span>
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}