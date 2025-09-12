import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import Error from "./Error";
import { useFirestoreRealtime } from "../services/useFirestore";
import PostList from "../components/PostList";

export default function Home() {
    const postCollection = 'posts';

    const { data, error, loading } = useFirestoreRealtime<PostItemProps>({
        collectionName: postCollection,
        orderBy: [['created_at', 'desc']],
    });

    if (loading) return <Loading/>

    if (error) return <Error message={error}/>

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={data}/>
        </div>
    );
}