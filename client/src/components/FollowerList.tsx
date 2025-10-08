import { Link } from "react-router-dom";
import type { FollowersData } from "../services/custom-types";

export default function FollowerList(props: FollowersData) {
    return (
        <div className="flex justify-center items-center fixed inset-0 z-20 bg-[rgba(0,0,0,0.66)] p-[0.7rem]">
            <div className="bg-[#1a1a1a] p-[1rem] flex flex-col gap-[1rem] border border-purple-400 w-[450px] h-[600px]">
                {props.followers.map(follower => (
                    <div className="bg-black p-[0.6rem] rounded-[0.6rem] flex justify-between">
                        <div className="flex flex-col gap-[0.5rem]">
                            <Link to={`/about/${follower.user_id}`}>{follower.username}</Link>
                            <p className="text-[0.9rem]">{new Date(follower.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-white">
                            <i className="fa-regular fa-user"></i>
                        </div>
                    </div>
                ))}
                <div className="flex gap-[0.5rem]">
                    <button type="button" onClick={() => props.onClose(false)} className="bg-orange-400 text-gray-800 cursor-pointer p-[0.4rem] text-[0.9rem]">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button type="button" className="bg-purple-400 text-gray-800 cursor-pointer p-[0.4rem] text-[0.9rem]">
                        <span>Load More</span>
                    </button>
                </div>
            </div>
        </div>
    );
}