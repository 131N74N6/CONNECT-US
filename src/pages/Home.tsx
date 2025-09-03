import { useEffect } from "react";
import PostList from "../components/PostList";
import type { PostItemProps } from "../services/custom-types";
import useSupabaseTable from "../services/useSupabaseTable";

export default function Home() {
    const imageGalleryTable = 'image_gallery';
    const { realTimeInit, initTableData } = useSupabaseTable<PostItemProps>();
    const { data = [] } = initTableData({ tableName: imageGalleryTable });

    useEffect(() => {
        realTimeInit({ tableName: imageGalleryTable });
    }, [realTimeInit]);

    return (
        <div className="grid p-[1rem] grid-cols-3">
            <PostList data={data}/>
        </div>
    );
}