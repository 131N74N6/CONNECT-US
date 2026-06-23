import { useEffect, useState } from "react";
import Notification from "../components/Notification";
import PostServices from "../services/post.service";

export default function AddPost() {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error, setError]);

    const { 
        currentUserId, 
        description, 
        fileInputRef, 
        handleFileSelect, 
        insertMutation, 
        isProcessing, 
        mediaFiles, 
        navigate, 
        removeMediaFile, 
        setDescription 
    } = PostServices({ set_message: setError });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        insertMutation.mutate();
    }

    return (
        <section className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            {error ? 
                <Notification
                    class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] text-[2rem] font-[600] text-purple-700"
                    message={error}
                /> 
            : null}
            <form 
                onSubmit={handleSubmit}
                className="flex gap-[1.3rem] w-full p-[1rem] flex-col bg-[#1a1a1a] rounded-lg overflow-y-auto"
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleFileSelect}
                    multiple 
                    accept="image/*,video/*"
                    id="media-upload"
                />
                <section 
                    className="border-dashed h-screen p-[1rem] cursor-pointer border-2 border-purple-400 rounded-lg flex flex-col"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {mediaFiles.length === 0 ? (
                        <div className="flex flex-col items-center h-full justify-center text-purple-400">
                            <span className="text-lg">Click to select images or videos</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-h-75 overflow-y-auto">
                            {mediaFiles.map((media, index) => (
                                <div key={index} className="relative group">
                                    {media.type === 'image' ? (
                                        <img 
                                            src={media.previewUrl} 
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    ) : media.type === 'video' ? (
                                        <video 
                                            src={media.previewUrl}
                                            className="w-full h-32 object-cover rounded-lg"
                                            controls
                                        />
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                            e.stopPropagation();
                                            removeMediaFile(index);
                                        }}
                                        className="absolute top-1 right-1 cursor-pointer bg-[rgba(0,0,0,0.5)] text-white rounded-full p-[1rem] w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <textarea 
                    placeholder="Add description..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-[0.8rem] h-screen text-white bg-[#2a2a2a] border outline-0 border-gray-600 rounded-lg text-[0.9rem] font-[550] resize-none"
                ></textarea>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        type="button" 
                        onClick={() => navigate(`/about/${currentUserId}`)}
                        disabled={isProcessing}
                        className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isProcessing ? 'Uploading...' : 'Back'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isProcessing ? 'Uploading...' : 'Add Post'}
                    </button>
                </div>
            </form>
        </section>
    );
}