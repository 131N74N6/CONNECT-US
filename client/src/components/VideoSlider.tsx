import { useState } from "react";

interface PostSliderProps {
    videos: { file_url: string; }[];
}

export default function VideoSlider(props: PostSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        setCurrentIndex(prevIndex => prevIndex === 0 ? props.videos.length - 1 : prevIndex - 1);
    }

    const goToNext = () => {
        setCurrentIndex(prevIndex => prevIndex === props.videos.length - 1 ? 0 : prevIndex + 1);
    }

    if (props.videos.length === 0) return null;

    return (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video 
                src={props.videos[currentIndex].file_url} 
                controls 
                className="w-full h-auto max-h-96 object-contain"
            />
            
            {props.videos.length > 1 ? (
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
                        {props.videos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2  cursor-pointer h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
                            />
                        ))}
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                        {currentIndex + 1} / {props.videos.length}
                    </div>
                </>
            ) : null}
        </div>
    );
}