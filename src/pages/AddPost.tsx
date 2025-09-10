import { useState } from "react";
import { Navbar1, Navbar2 } from "../components/Navbar";
import useAuth from "../services/useAuth";

type MediaFile = {
    media: File;
    url: string;
}

export default function AddPost() {
    const { user } = useAuth();
    const [description, setDescription] = useState<string>('');
    const [media, setMedia] = useState<File[]>();
    const postsCollection = 'posts';
    let chosenMedia: MediaFile[] = [];

    async function handleChosenMedia(event: React.ChangeEvent<HTMLInputElement>) {
        const getMedia = event.target.files;
        if (!getMedia) return;
        for (let i = 0; i < getMedia?.length; i++) {
            const media = getMedia[i];
            const mediaUrl = URL.createObjectURL(media);
            chosenMedia.push({ media: media, url: mediaUrl });
        }
    }

    async function addNewPost(event: React.FormEvent) {
        event.preventDefault();
    }
    return (
        <div className="bg-black flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem]">
            <Navbar1/>
            <Navbar2/>
            <form 
                onSubmit={addNewPost} 
                title="image-upload-field"
                className="flex gap-[1.3rem] md:w-3/4 w-full overflow-y-auto p-[1rem] flex-col bg-[#1a1a1a]"
            >
                <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleChosenMedia}
                    multiple accept=".jpg,.png,.jpeg" placeholder="select-your-file"
                />
                <section className="border-dashed h-screen p-[0.5rem] cursor-pointer border outline-0 border-purple-400 ">
                    <div className="flex justify-center text-purple-400 items-center"><span>No Images Selected</span></div>
                </section>
                <textarea 
                    placeholder="add description..." 
                    value={description}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                    className="p-[0.45rem] text-purple-400 border outline-0 border-purple-400 h-screen text-[0.9rem] font-[550] resize-none"
                ></textarea>
                <button type="submit" className="text-[0.9rem] p-[0.45rem] rounded-[0.45rem] font-[550] cursor-pointer bg-[#765898] text-[#FFFFFF]">Add Post</button>
            </form>
        </div>
    )
}