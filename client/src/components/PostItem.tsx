import { Link } from "react-router-dom";
import type { PostItemProps } from "../models/post-model";
import { useState } from "react";

export default function PostItem(props: PostItemProps) {
    const [imageError, setImageError] = useState<boolean>(false);
    const [videoError, setVideoError] = useState<boolean>(false);
    
    const getPostFiles = props.posts_file ? props.posts_file : [];
    
    if (getPostFiles.length === 0) {
        return (
            <Link to={`/post/${props._id}`} className="block">
                <div className="rounded-lg border border-purple-400 bg-[#1a1a1a] aspect-square flex items-center justify-center p-4">
                    <div className="text-center">
                        <p className="text-purple-400 md:line-clamp-3 line-clamp-1">{props.description}</p>
                    </div>
                </div>
            </Link>
        );
    }
    
    return (
        <Link to={`/post/${props._id}`} className="block h-full">
            <div className="rounded-lg relative aspect-square bg-gray-800">                
                {getPostFiles[0].file_url.includes('image') && !imageError ? (
                    <img 
                        className="w-full h-full object-cover"
                        src={getPostFiles[0].file_url}
                        onError={() => setImageError(true)}
                    />
                ) : getPostFiles[0].file_url.includes('video') && !videoError ? (
                    <video
                        muted
                        autoPlay
                        className="w-full h-full object-cover"
                        onError={() => setVideoError(true)}
                    >
                        <source src={getPostFiles[0].file_url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <span className="text-gray-400 text-sm">Media not available</span>
                    </div>
                )}
                
                {getPostFiles.length > 1 ? (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-white text-xs">+{getPostFiles.length - 1}</span>
                    </div>
                ) : null}
            </div>
        </Link>
    );
}