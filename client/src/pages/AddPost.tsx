import { useState, useRef, useEffect } from "react";
import { Navbar1, Navbar2 } from "../components/Navbar";
import useAuth from "../services/useAuth";
import DataModifier from "../services/data-modifier";
import { uploadToCloudinary } from "../services/media-storage";
import type { MediaFile, PostDetail } from "../services/custom-types";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddPost() {
    const postFolder = 'sns_posts';
    const { user } = useAuth();
    const navigate = useNavigate();
    const { insertData } = DataModifier();
    const queryQlient = useQueryClient();

    const [description, setDescription] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState({ isError: false, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newMediaFiles: MediaFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file.type.split('/')[0];
            
            if (fileType !== 'image' && fileType !== 'video') {
                setError({ isError: true, message: 'Only images and videos are allowed' });
                continue;
            }
            
            newMediaFiles.push({
                file,
                previewUrl: URL.createObjectURL(file),
                type: fileType as 'image' | 'video'
            });
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
        mutationFn: async () => {
            const getCurrentDate = new Date();
            const postsFiles: { file_url: string; public_id: string; }[] = [];
            
            for (const mediaFile of mediaFiles) {
                const result = await uploadToCloudinary(mediaFile.file, postFolder);
                postsFiles.push({ file_url: result.url, public_id: result.publicId });
            }
            
            if (!user) {
                setError({ isError: true, message: 'You must be logged in to create a post' });
                return;
            }

            await insertData<PostDetail>({
                api_url: `http://localhost:1234/posts/add`,
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
        }
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        if (description.trim() === '' && mediaFiles.length === 0) {
            setError({ isError: true, message: 'Post must contain either text or media' });
            return;
        }
        
        setIsUploading(true);
        
        try {
            insertMutation.mutate();
        } catch (error) {
            setError({ isError: true, message: 'Failed to create post' });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <section className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <Navbar1/>
            <Navbar2/>
            {error.isError ? 
                <Notification
                    class_name="border-purple-400 border p-[0.5rem] text-center text-white bg-[#1a1a1a] w-[320px] h-[88px] absolute top-[5%] left-[50%] right-[50%]"
                    message={error.message}
                /> 
            : null}
            <form 
                onSubmit={handleSubmit}
                className="flex gap-[1.3rem] md:w-3/4 w-full p-[1rem] flex-col bg-[#1a1a1a] rounded-lg overflow-y-auto"
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
                    className="border-dashed h-screen p-[1rem] cursor-pointer border-2 border-purple-400 rounded-lg flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {mediaFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-purple-400">
                            <span className="text-lg">Click to select images or videos</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
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
                
                <button 
                    type="submit" 
                    disabled={isUploading}
                    className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                >
                    {isUploading ? 'Uploading...' : 'Add Post'}
                </button>
            </form>
        </section>
    );
}