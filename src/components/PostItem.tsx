import { Link } from "react-router-dom";
import type { PostItemProps } from "../services/custom-types";

export default function PostItem(props: PostItemProps) {
    return (    
        <Link to={`/post/${props.id}`}>
            <div className="image-wrap w-full aspect-square overflow-hidden rounded-t-lg">
                <img className="w-full h-full object-cover block" src={props.image_url}/>
            </div>
        </Link>
    );
}