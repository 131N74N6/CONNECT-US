import { Link } from "react-router-dom";
import type { PostItemProps } from "../services/custom-types";
import { useState, useMemo } from "react";

export default function PostItem(props: PostItemProps) {
    const [imageError, setImageError] = useState(false);
    const [videoError, setVideoError] = useState(false);
    
    const fileUrls = props.file_url || [];
    
    const mediaType = useMemo(() => {
        if (fileUrls.length === 0) return 'text';
        
        const firstFile = fileUrls[0];
        if (!firstFile) return 'text';
        
        if (firstFile.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(firstFile)) {
            return 'image';
        } else if (firstFile.includes('video') || /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(firstFile)) {
            return 'video';
        }
        return 'text';
    }, [fileUrls]);
    
    if (fileUrls.length === 0 || mediaType === 'text') {
        return (
            <Link to={`/post/${props.id}`} className="block">
                <div className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-purple-400 bg-[#1a1a1a]">
                    <div className="w-full aspect-square flex items-center justify-center p-4">
                        <div className="text-center">
                            <p className="text-purple-400 line-clamp-3">
                                {props.description}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }
    
    return (
        <Link to={`/post/${props.id}`} className="block h-full">
            <div className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-gray-800">
                <div className="w-full aspect-square overflow-hidden relative">
                    {mediaType === 'image' && !imageError ? (
                        <img 
                            className="w-full h-full object-cover"
                            src={fileUrls[0]}
                            onError={() => setImageError(true)}
                        />
                    ) : mediaType === 'video' && !videoError ? (
                        <video
                            muted
                            autoPlay
                            className="w-full h-full object-cover"
                            onError={() => setVideoError(true)}
                        >
                            <source src={fileUrls[0]} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            <span className="text-gray-400 text-sm">Media not available</span>
                        </div>
                    )}
                    
                    {fileUrls.length > 1 ? (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-white text-xs">+{fileUrls.length - 1}</span>
                        </div>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}