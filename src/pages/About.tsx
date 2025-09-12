import type { PostItemProps } from "../services/custom-types";
import useAuth from "../services/useAuth";
import { useShowDocument } from "../services/useFirestore";
import PostList from "../components/PostList";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import type { OrderByDirection, WhereFilterOp } from "firebase/firestore";

export default function About() {
    const postCollection = 'posts';
    const { user } = useAuth();

    const { data, error, loading } = useShowDocument<PostItemProps>({
        collectionName: postCollection,
        filters: [['user_id', '==', user?.uid]] as [string, WhereFilterOp, any][],
        orderBy: [['created_at', 'desc']] as [string, OrderByDirection][]
    });

    if (loading) return <Loading/>

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <span className="text-[2rem] font-[600] text-purple-700">{error}</span>
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