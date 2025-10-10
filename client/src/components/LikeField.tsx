import type { IComments, ILikes } from "../services/custom-types";

type LikeFieldPorps = {
    commentsData: IComments[] | undefined;
    givingLikes: () => Promise<void>;
    likesData: ILikes[] | undefined;
    setOpenComments: (value: React.SetStateAction<boolean>) => void;
    userLiked: boolean | "" | null | undefined
    setShowLikes: (value: React.SetStateAction<boolean>) => void;
}

export default function LikeField(props: LikeFieldPorps) {
    return (
        <div className="flex gap-[1rem]">
            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                <i 
                    className={`fa-${props.userLiked ? 'solid' : 'regular'} fa-heart cursor-pointer ${props.userLiked ? 'text-red-500' : ''}`} 
                    onClick={props.givingLikes}
                ></i>
                <span onClick={() => props.setShowLikes(true)} className="cursor-pointer">
                    {props.likesData ? props.likesData.length : 0}
                </span>
            </div>
            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                <i className="fa-regular fa-comment cursor-pointer" onClick={() => props.setOpenComments(true)}></i>
                <span>{props.commentsData ? props.commentsData.length : 0}</span>
            </div>
        </div>
    );
}