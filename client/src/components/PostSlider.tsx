import { useEffect, useState } from "react";
import Loading from "./Loading";

interface PostSliderProps {
    post_files: { file_url: string; }[];
}

export default function PostSlider(props: PostSliderProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        const currentFile = props.post_files[currentIndex];
        
        if (currentFile.file_url.includes('image')) {
            const img = new Image();
            img.src = currentFile.file_url;
            img.onload = () => setIsLoading(false);
            img.onerror = () => setIsLoading(false);
        } else if (currentFile.file_url.includes('video')) {
            const video = document.createElement('video');
            video.src = currentFile.file_url;
            video.onloadedmetadata = () => setIsLoading(false);
            video.onerror = () => setIsLoading(false);
        }
    }, [currentIndex, props.post_files]);

    const goToPrevious = () => {
        setCurrentIndex(prevIndex => prevIndex === 0 ? props.post_files.length - 1 : prevIndex - 1);
    }

    const goToNext = () => {
        setCurrentIndex(prevIndex => prevIndex === props.post_files.length - 1 ? 0 : prevIndex + 1);
    }

    if (props.post_files.length === 0) return null;

    return (
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            ) : null}
            {props.post_files[currentIndex].file_url.includes('image') ? (
                <img 
                    src={props.post_files[currentIndex].file_url} 
                    alt={`Slide ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                />
            ) : props.post_files[currentIndex].file_url.includes('video') ? (
                <video 
                    src={props.post_files[currentIndex].file_url} 
                    controls 
                    className="w-full h-auto max-h-96 object-contain"
                />
            ) : null}
            {props.post_files.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={goToPrevious}
                        className="absolute cursor-pointer left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                        <i className="fa-solid fa-square-caret-left"></i>
                    </button>
                    <button
                        type="button"
                        onClick={goToNext}
                        className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                        <i className="fa-solid fa-square-caret-right"></i>
                    </button>
                    
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                        {props.post_files.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2  cursor-pointer h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
                            />
                        ))}
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                        {currentIndex + 1} / {props.post_files.length}
                    </div>
                </>
            ) : null}
        </div>
    );
}
