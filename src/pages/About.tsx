import { useEffect } from "react";
import type { PostItemProps } from "../services/custom-types";
import useAuth from "../services/useAuth";
import useDbTable from "../services/useFirestore";
import PostList from "../components/PostList";
import { Navbar1, Navbar2 } from "../components/Navbar";

export default function About() {
    const imageGalleryTable = 'image_gallery';
    const { user } = useAuth();
    const { realTimeInit, initTableData, teardownTable } = useDbTable<PostItemProps>();
    const { data = [], error } = initTableData({
        tableName: imageGalleryTable,
        additionalQuery: (addQuery) => user?.id ? addQuery.eq('user_id', user.id) : addQuery,
        uniqueQueryKey: user?.id ? [user.id] : ['no-user']
    });

    useEffect(() => {
        if (user?.id) {
            realTimeInit({
                tableName: imageGalleryTable,
                additionalQuery: (addQuery) => addQuery.eq('user_id', user.id),
                uniqueQueryKey: [user.id]
            });
        }
        return () => teardownTable();
    }, [teardownTable, user?.id, realTimeInit]);

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