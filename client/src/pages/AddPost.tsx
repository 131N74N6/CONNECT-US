import { useState, useRef, useEffect } from "react";
import useAuth from "../services/auth.service";
import DataModifier from "../services/data.service";
import { uploadToCloudinary } from "../services/cloud.service";
import type { MediaFile, PostDetail } from "../services/custom-types";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "../components/Loading";

export default function AddPost() {
    const postFolder = 'sns_posts';
    const { loading, user } = useAuth();
    const navigate = useNavigate();
    const { error, insertData, setError } = DataModifier();
    const queryQlient = useQueryClient();
    const currentUserId = user ? user.info.id : '';

    const [description, setDescription] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newMediaFiles: MediaFile[] = [];

        for (let r = 0; r < files.length; r++) {
            const file = files[r];
            const previewUrl = URL.createObjectURL(file);
            const fileType = file.type.split('/')[0];
            
            if (fileType !== 'image' && fileType !== 'video') {
                URL.revokeObjectURL(previewUrl);
                continue;
            }
            
            newMediaFiles.push({ file, previewUrl, type: fileType as 'image' | 'video' });
        }

        setMediaFiles(prev => [...prev, ...newMediaFiles]);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const removeMediaFile = (index: number) => {
        const fileToRemove = mediaFiles[index];
        URL.revokeObjectURL(fileToRemove.previewUrl);
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    }

    const insertMutation = useMutation({
        onMutate: () => setIsUploading(true),
        mutationFn: async () => {
            if (!user) return;

            const getCurrentDate = new Date();
            const postsFiles: { file_url: string; public_id: string; }[] = [];
            
            for (const mediaFile of mediaFiles) {
                const result = await uploadToCloudinary(mediaFile.file, postFolder);
                postsFiles.push({ file_url: result.url, public_id: result.publicId });
            }

            await insertData<PostDetail>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/posts/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    description: description.trim(),
                    posts_file: postsFiles,
                    uploader_name: user.info.username,
                    user_id: user.info.id,
                }
            });
        },
        onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: ['all-posts'] });
            queryQlient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            setDescription('');
            setMediaFiles([]);
            navigate('/home');
        },
        onSettled: () => setIsUploading(false),
        onError: () => {}
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        insertMutation.mutate();
    }
    
    if (loading) return (
        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
            <Loading/>
        </div>
    );

    if (!user) return (
        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
            <span className="text-[2rem] font-[600] text-purple-700">please sign in to see post</span>
        </div>
    );

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
                                    ) : (
                                        <video 
                                            src={media.previewUrl}
                                            className="w-full h-32 object-cover rounded-lg"
                                            controls
                                        />
                                    )}
                                    
                                    <button
                                        type="button"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                            e.stopPropagation();
                                            removeMediaFile(index);
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-[1rem] w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                        disabled={isUploading}
                        className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isUploading ? 'Uploading...' : 'Back'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isUploading ? 'Uploading...' : 'Add Post'}
                    </button>
                </div>
            </form>
        </section>
    );
}