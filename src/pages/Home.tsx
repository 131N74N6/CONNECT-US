import { useEffect } from "react";
import PostList from "../components/PostList";
import type { PostItemProps } from "../services/custom-types";
import useDbTable from "../services/useDbTable";
import useAuth from "../services/useAuth";
import { Navbar1, Navbar2 } from "../components/Navbar";

export default function Home() {
    const imageGalleryTable = 'image_gallery';
    const { user } = useAuth();
    const { realTimeInit, initTableData, teardownTable } = useDbTable<PostItemProps>();
    const { data = [], error } = initTableData({ tableName: imageGalleryTable });

    useEffect(() => {
        if (user) realTimeInit({ tableName: imageGalleryTable });
        return () => teardownTable();
    }, [realTimeInit, teardownTable, user]);

    if (error) {
        const errorMessage = error.name === "TypeError" && error.message === "Failed to fetch" 
            ? "Check your internet connection" 
            : error.message;
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="text-[2rem] font-[600] text-purple-700">{errorMessage}</span>
            </div>
        );
    }

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen">
            <Navbar1/>
            <Navbar2/>
            <PostList data={data}/>
        </div>
    );
}