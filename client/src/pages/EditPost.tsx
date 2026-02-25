import { useNavigate, useParams } from "react-router-dom";
import DataModifier from "../services/data.service";
import useAuth from "../services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { MediaFile, PostDetail } from "../services/custom-types";
import { uploadToCloudinary } from "../services/cloud.service";
import Loading from "../components/Loading";
import { X } from "lucide-react";

export default function EditPost() {
    const postFolder = 'sns_posts';
    const { _id } = useParams();
    const { loading, user } = useAuth();
    const navigate = useNavigate();
    const { deleteData, getData, updateData } = DataModifier();
    const queryQlient = useQueryClient();
    const currentUserId = user ? user.info.id : '';

    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [existingFiles, setExistingFiles] = useState<{ file_url: string; public_id: string }[]>([]);
    const [description, setDescription] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [error, setError] = useState({ isError: false, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error.isError) {
            const timeout = setTimeout(() => setError({ isError: false, message: '' }), 3000);
            return () => clearTimeout(timeout);
        }
    }, [error.isError]);

    const { data: selectedPost } = getData<PostDetail[]>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/posts/selected/${_id}`, 
        query_key: [`edit-selected-post-${_id}`],
        stale_time: 660000
    });

    useEffect(() => {
        if (selectedPost && selectedPost.length > 0) {
            selectedPost[0].posts_file ? setExistingFiles([...selectedPost[0].posts_file]) : setExistingFiles([]);
            setDescription(selectedPost[0].description);
        }
    }, [_id, selectedPost]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newMediaFiles: MediaFile[] = [];

        for (let a = 0; a < files.length; a++) {
            const file = files[a];
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

    function removeMediaFile(index: number) {
        const fileToRemove = mediaFiles[index];
        URL.revokeObjectURL(fileToRemove.previewUrl);
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    }

    function removeExistingFile(public_id: string) {
        setExistingFiles(prev => prev.filter(file => file.public_id !== public_id));
        setSelectedFiles(prev => [...prev, public_id]);
    }

    const updatePostMutation = useMutation({
        onMutate: () => setIsEditing(true),
        mutationFn: async () => {
            const newPostsFiles: { file_url: string; public_id: string; }[] = [];
            
            for (const mediaFile of mediaFiles) {
                const result = await uploadToCloudinary(mediaFile.file, postFolder);
                newPostsFiles.push({ file_url: result.url, public_id: result.publicId });
            }
        
            if (selectedFiles.length > 0) {
                await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-chosen`)
            }

            await updateData<PostDetail>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/posts/edit/${_id}`,
                data: {
                    description: description.trim(),
                    posts_file: [...existingFiles, ...newPostsFiles],
                }
            });
        },
        onError: () => {},
        onSuccess: () => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            queryQlient.invalidateQueries({ queryKey: ['all-posts'] });
            queryQlient.invalidateQueries({ queryKey: [`edit-selected-post-${_id}`] });
            queryQlient.invalidateQueries({ queryKey: [`signed-user-posts-${currentUserId}`] });
            navigate(`/about/${currentUserId}`);
        },
        onSettled: () => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setIsEditing(false);
            setDescription('');
            setMediaFiles([]);
            setExistingFiles([]);
            setSelectedFiles([]);
        },
    });

    const handleUpdatePost = (event: React.FormEvent) => {
        event.preventDefault();
        updatePostMutation.mutate();
    }
    
    if (loading) return (
        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
            <Loading/>
        </div>
    );

    return (
        <section className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            {error.isError ? 
                <></>
            : null}
            <form 
                onSubmit={handleUpdatePost}
                className="flex gap-[1.3rem] w-full min-h-[300px] p-[1rem] flex-col bg-[#1a1a1a] rounded-lg overflow-y-auto"
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
                                    ) : null}
                                    {media.file_url.includes('video') ? (
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
                                        className="absolute top-1 right-1 bg-[rgba(0,0,0,0.5)] rounded-full w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <X size={22} color="white"></X>
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
                                    ) : null}
                                    {media.type === 'video' ? (
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
                                        className="absolute top-1 right-1 bg-[rgba(0,0,0,0.5)] rounded-full p-[1rem] w-6 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <X size={22} color="white"></X>
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
                        disabled={isEditing}
                        className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isEditing ? 'Uploading...' : 'Back'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isEditing}
                        className="text-[0.9rem] p-[0.8rem] rounded-lg font-[550] cursor-pointer bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                        {isEditing ? 'Uploading...' : 'Edit Post'}
                    </button>
                </div>
            </form>
        </section>
    );
}