import { Link } from "react-router-dom";
import type { LikeDataProps } from "../services/custom-types";

export default function LikeItem(props: Pick<LikeDataProps, "created_at" | "user_id" | "username">) {
    return (
        <div className="bg-black p-[0.6rem] flex rounded-[0.6rem] items-center gap-[0.8rem] border border-orange-400">
            <div className="text-white text-[1.1rem]">
                <i className="fa-regular fa-user"></i>
            </div>
            <div className="flex flex-col gap-[0.5rem] text-white">
                <Link to={`/about/${props.user_id}`}>{props.username}</Link>
                <p className="text-[0.9rem]">{new Date(props.created_at).toLocaleString()}</p>
            </div>
        </div>
    );
}