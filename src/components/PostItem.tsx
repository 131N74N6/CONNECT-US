import { Link } from "react-router-dom";
import type { PostItemProps } from "../services/custom-types";

export default function PostItem(props: PostItemProps) {
    return (    
        <Link to={`/post/${props.id}`}>
            <div className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="image-wrap w-full aspect-square overflow-hidden rounded-t-lg">
                    {props.file_url.map((file, index) => (
                        <img key={`file_${props.id}_${index}`} className="w-full h-full object-cover block" src={file}/>
                    ))}
                </div>
            </div>
        </Link>
    );
}