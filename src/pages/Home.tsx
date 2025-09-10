import { useEffect } from "react";
import PostList from "../components/PostList";
import type { PostItemProps } from "../services/custom-types";
import useFirestore from "../services/useFirestore";
import useAuth from "../services/useAuth";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";

export default function Home() {
    const imageGalleryCollection = 'image_gallery';
    const { user } = useAuth();
    const { data, error, getCollection, loading } = useFirestore<PostItemProps>();

    useEffect(() => {
        if (user) getCollection(imageGalleryCollection);
    }, [user]);

    if (loading) return <Loading/>

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="text-[2rem] font-[600] text-purple-700">{error}</span>
            </div>
        );
    }

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={data}/>
        </div>
    );
}