import { Link } from "react-router-dom";
import type { FollowersDataProps, FollowedDataProps } from "../services/custom-types";
import Loading from "./Loading";

export function FollowerList(props: FollowersDataProps) {
    return (
        <section className="flex justify-center items-center fixed inset-0 z-20 bg-[rgba(0,0,0,0.66)] p-[0.7rem]">
            <div className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem] border border-purple-400 w-[450px] h-[600px]">
                <div className="flex flex-col gap-[1rem] border-b border-purple-400 h-[100%] overflow-y-auto">
                    {props.followers.length > 0 ? (
                        props.followers.map(follower => (
                            <div key={`fld_${follower.user_id}`} className="bg-black p-[0.6rem] flex rounded-[0.6rem] items-center gap-[0.8rem] border border-orange-400">
                                <div className="text-white text-[1.1rem]">
                                    <i className="fa-regular fa-user"></i>
                                </div>
                                <div className="flex flex-col gap-[0.5rem] text-white">
                                    <Link to={`/about/${follower.user_id}`} onClick={() => props.onClose(false)}>{follower.username}</Link>
                                    <p className="text-[0.9rem]">{new Date(follower.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full text-white">
                            <span className="text-center font-[550] text-[1.6rem]">No Followers</span>
                        </div>
                    )}
                    {props.loadMore ? <div className="flex justify-center"><Loading/></div> : null}
                </div>
                <div className="grid grid-cols-2 gap-[0.5rem]">
                    <button 
                        type="button" 
                        onClick={() => props.onClose(false)} 
                        className="bg-orange-400 text-gray-800 rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem]"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button 
                        type="button" 
                        disabled={props.isReachedEnd || !props.loadMore}
                        onClick={() => props.setSize(props.size + 1)}
                        className="bg-purple-400 font-[500] rounded text-gray-800 cursor-pointer p-[0.4rem] text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Load More</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

export function FollowingList(props: FollowedDataProps) {
    return (
        <section className="flex justify-center items-center fixed inset-0 z-20 bg-[rgba(0,0,0,0.66)] p-[0.7rem]">
            <div className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem] border border-purple-400 w-[450px] h-[600px]">
                <div className="flex flex-col gap-[1rem] border-b border-purple-400 h-[100%] overflow-y-auto">
                    {props.followed.length > 0 ? (
                        props.followed.map(flg => (
                            <div key={`fld_${flg.followed_user_id}`} className="bg-black p-[0.6rem] flex rounded-[0.6rem] items-center gap-[0.8rem] border border-orange-400">
                                <div className="text-white text-[1.1rem]">
                                    <i className="fa-regular fa-user"></i>
                                </div>
                                <div className="flex flex-col gap-[0.5rem] text-white">
                                    <Link to={`/about/${flg.followed_user_id}`} onClick={() => props.onClose(false)}>{flg.followed_username}</Link>
                                    <p className="text-[0.9rem]">{new Date(flg.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full text-white">
                            <span className="text-center font-[550] text-[1.6rem]">No User Followed</span>
                        </div>
                    )}
                    {props.loadMore ? <div className="flex justify-center"><Loading/></div> : null}
                </div>
                <div className="grid grid-cols-2 gap-[0.5rem]">
                    <button 
                        type="button" 
                        onClick={() => props.onClose(false)} 
                        className="bg-orange-400 text-gray-800 rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem]"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button 
                        type="button" 
                        disabled={props.isReachedEnd || !props.loadMore}
                        onClick={() => props.setSize(props.size + 1)}
                        className="bg-purple-400 font-[500] rounded text-gray-800 cursor-pointer p-[0.4rem] text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Load More</span>
                    </button>
                </div>
            </div>
        </section>
    );
}