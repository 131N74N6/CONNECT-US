import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import Error from "./Error";
import { useFirestoreQueryTanstack } from "../services/useFirestore";
import PostList from "../components/PostList";
import useAuth from "../services/useAuth";

export default function About() {
    const postCollection = 'posts';
    const { user, loading: authLoading, error: authError } = useAuth();

    const { data, error, isLoading } = useFirestoreQueryTanstack<PostItemProps>(
        postCollection,
        user ? [['user_id', '==', user.uid]] : undefined,
        [['created_at', 'desc']],
        undefined,
        { enabled: !!user }
    );

    if (authLoading) return <Loading/>;

    if (authError) return <Error message={authError}/>;

    if (isLoading) return <Loading/>;

    if (error) return <Error message={error.message}/>;
    
    console.log(data);

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={data || []}/>
        </div>
    );
}