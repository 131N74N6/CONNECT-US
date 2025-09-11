import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import { useShowDocument } from "../services/useFirestore";
// import { useEffect } from "react";

export default function Home() {
    const postCollection = 'posts';
    const { data, error, loading } = useShowDocument<PostItemProps>({
        collectionName: postCollection,
        orderBy: [['created_at', 'desc']]
    });
    
    // useEffect(() => {
    //     if (data.length > 0) {
    //         console.log('Posts data:', data);
    //     }
    // }, [data]);

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
            {/* <PostList data={data}/> */}
        </div>
    );
}