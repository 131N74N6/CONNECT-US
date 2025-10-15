type LikeFieldPorps = {
    comment_total: number;
    givingLikes: () => void;
    likes_total: number;
    setOpenComments: (value: React.SetStateAction<boolean>) => void;
    userLiked: boolean | "" | null | undefined
}

export default function LikeField(props: LikeFieldPorps) {
    return (
        <div className="flex gap-[1rem]">
            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                <i 
                    className={`fa-${props.userLiked ? 'solid' : 'regular'} fa-heart cursor-pointer ${props.userLiked ? 'text-red-500' : ''}`} 
                    onClick={props.givingLikes}
                ></i>
                <span>
                    {props.likes_total}
                </span>
            </div>
            <div className="flex gap-[0.5rem] items-center text-[1.2rem]">
                <i className="fa-regular fa-comment cursor-pointer" onClick={() => props.setOpenComments(true)}></i>
                <span>{props.comment_total}</span>
            </div>
        </div>
    );
}