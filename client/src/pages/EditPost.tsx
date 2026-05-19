import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Notification from "../components/Notification";
import PostServices from "../services/post.service";
import Loading from "../components/Loading";

export default function EditPost() {
    const { _id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!_id) navigate('/home');
    }, [_id, navigate]);

    const { 
        currentUserId, description, error, existingFiles, handleFileSelect, isProcessing, fileInputRef, mediaFiles, 
        removeMediaFile, removeExistingFile, selectedPostData, setDescription, setError, setExistingFiles, 
        updatePostMutation 
    } = PostServices({ id: _id });

    const { selectedPost, errorPost, postLoading } = selectedPostData;

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error]);


    useEffect(() => {
        if (selectedPost && selectedPost.length > 0) {
            selectedPost[0].posts_file ? setExistingFiles([...selectedPost[0].posts_file]) : setExistingFiles([]);
            setDescription(selectedPost[0].description);
        }
    }, [_id, selectedPost]);

    const handleUpdatePost = (event: React.FormEvent) => {
        event.preventDefault();
        updatePostMutation.mutate();
    }

    return (
        <section className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <form 
                onSubmit={handleUpdatePost}
                className="flex gap-[1.3rem] w-full min-h-[300px] p-[1rem] flex-col bg-[#1a1a1a] rounded-lg overflow-y-auto"
            >
                {error ? 
                    <Notification
                        class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] text-[2rem] font-[600] text-purple-700"
                        message={error}
                    /> 
                : null}
                {postLoading ? (
                    <div className="flex justify-center items-center h-full"><Loading/></div> 
                ) : errorPost ? (
                    <div className="flex justify-center items-center h-full"><span>{errorPost.message}</span></div>
                ) : (
                    <div className="flex gap-[1.3rem] w-full min-h-[300px] p-[1rem] flex-col bg-[#1a1a1a] rounded-lg overflow-y-auto">
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
                            {mediaFiles.length === 0 && existingFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-purple-400">
                                    <span className="text-lg">Click to select images or videos</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-h-75 overflow-y-auto">
                                    {existingFiles.map((media, index) => (
                                        <div className="relative group">
                                            {media.file_url.includes('image') ? (
                                                <img 
                                                    src={media.file_url} 
                                                    key={`Preview-img-${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : media.file_url.includes('video') ? (
                                                <video 
                                                    src={media.file_url}
                                                    key={`Preview-vid-${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                    controls
                                                /> 
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                                    e.stopPropagation();
                                                    removeExistingFile(media.public_id);
                                                }}
                                                className="absolute top-1 right-1 cursor-pointer bg-[rgba(0,0,0,0.5)] text-white rounded-full p-[1rem] w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {mediaFiles.map((media, index) => (
                                        <div className="relative group">
                                            {media.type === 'image' ? (
                                                <img 
                                                    src={media.previewUrl} 
                                                    alt={`Preview ${index + 1}`}
                                                    key={`Exist-img-${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : media.type === 'video' ? (
                                                <video 
                                                    src={media.previewUrl}
                                                    key={`Exist-vid-${index + 1}`}
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
                                {isProcessing ? 'Uploading...' : 'Edit Post'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </section>
    );
}