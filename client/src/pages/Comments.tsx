import { Link, useParams } from "react-router-dom";
import useAuth from "../services/useAuth";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DataModifier from "../services/data-modifier";
import type { IComments, PostDetail } from "../services/custom-types";
import Loading from "../components/Loading";
import { Navbar1, Navbar2 } from "../components/Navbar";

export default function Comments() {
    const queryClient = useQueryClient();
    const { _id } = useParams();
    const { user } = useAuth();
    const { getData, infiniteScroll, insertData } = DataModifier();
    
    const [isSendComment, setIsSendComment] = useState<boolean>(false);
    const [comment, setComment] = useState<string>('');
    const [error, setError] = useState({ isError: false, message: '' });
    
    const { data: selectedPost } = getData<PostDetail[]>({
        api_url: `http://localhost:1234/posts/selected/${_id}`,
        query_key: [`selected-post-${_id}`],
        stale_time: 600000
    });
    
    const {
        data: commentsData,
        isReachedEnd: commentsReachedEnd,
        isLoadingMore: loadMoreComments,
        fetchNextPage: fetchMoreComments,
    } =  infiniteScroll<Pick<IComments, 'created_at' | 'username' | 'opinions'>>({
        api_url: _id ? `http://localhost:1234/comments/get-all/${_id}` : ``, 
        limit: 12,
        stale_time: 1000,
        query_key: `comments-${_id}`
    });

    const commentMutation = useMutation({
        onMutate: () => setIsSendComment(true),
        mutationFn: async () => {
            const getCurrentDate = new Date();

            if (!user || !_id || !selectedPost) return;
            if (!comment.trim()) return;

            await insertData<IComments>({
                api_url: `http://localhost:1234/comments/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    opinions: comment.trim(),
                    post_id: _id,
                    user_id: user.info.id,
                    username: user.info.username,
                    post_owner_id: selectedPost?.[0]?.user_id
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`comments-${_id}`] });
            queryClient.invalidateQueries({ queryKey: [`comments-total-${_id}`] });
        },
        onSettled: () => {
            setComment('');
            setIsSendComment(false);
        },
        onError: () => setError({ isError: true, message: error.message || 'Failed to send comment' })
    });

    function sendComment(event: React.FormEvent): void {
        event.preventDefault();
        if (isSendComment) return;
        commentMutation.mutate();
    }
    
    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black text-white relative z-10">
            <Navbar1/>
            <Navbar2/>
            <div className="md:w-3/4 w-full min-h-[300px] flex flex-col gap-[0.8rem] bg-[#1a1a1a] rounded-lg overflow-y-auto p-[0.8rem]">
                <div className="flex flex-col gap-[1rem] pb-[1rem] border-b border-purple-400 h-[88%] overflow-y-auto">
                    {commentsData.length > 0 ?
                        commentsData.map((comment, index) => (
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
                    {loadMoreComments ? <div className="flex justify-center"><Loading/></div> : null}
                    {commentsReachedEnd ? (
                        <div className="text-center">
                            <span>No Comments to Load</span>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button 
                                type="button"
                                onClick={() => fetchMoreComments()}
                                className="bg-pink-300 text-gray-800 w-[120px] rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem]"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
                <form className="flex flex-col gap-[1rem] h-[12%]" onSubmit={sendComment}>
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
                            disabled={!comment || isSendComment}
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