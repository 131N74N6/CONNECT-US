import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import { infiniteScroll } from "../services/useFirestore";
import PostList from "../components/PostList";
import useAuth from "../services/useAuth";
import { useCallback, useEffect, useMemo } from "react";
import type { WhereFilterOp } from "firebase/firestore";

export default function About() {
    const postCollection = 'posts';
    const { user } = useAuth();
    
    const filter = useMemo(() => {
        if (user) { 
            console.log("Current user UID:", user.uid);
            return [['user_id', '==', user.uid] as [string, WhereFilterOp, any]];
        }
        return undefined;
    }, [user?.uid]);

    const { data, loading, hasMore, fetchData } = infiniteScroll<PostItemProps>({
        collection_name: postCollection,
        filters: filter,
        order_by_options: [['created_at', 'desc']], 
        page_size: 12
    });

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500 && hasMore && !loading) {
            fetchData();
        }
    }, [hasMore, loading, fetchData]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    if (loading) return <Loading/>;

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={data} has_more={hasMore}/>
        </div>
    );
}