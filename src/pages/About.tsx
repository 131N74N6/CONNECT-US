import type { PostItemProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import Error from "./Error";
import { infinteScroll } from "../services/useFirestore";
import PostList from "../components/PostList";
import useAuth from "../services/useAuth";

export default function About() {
    const postCollection = 'posts';
    const { user, loading: authLoading, error: authError } = useAuth();

    const { data, loading } = infinteScroll<PostItemProps>(
        postCollection,
        user ? [['user_id', '==', user.uid]] : undefined,
        [['created_at', 'desc']], 
        10 
    );

    if (authLoading) return <Loading/>;

    if (authError) return <Error message={'400 | FAILED TO GET USER DATA'}/>;

    if (loading) return <Loading/>;
    
    console.log(data);

    return (
        <div className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <PostList data={data}/>
        </div>
    );
}