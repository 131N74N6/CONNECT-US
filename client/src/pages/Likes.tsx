import { useParams } from "react-router-dom";
import DataModifier from "../services/data.service";
import type { LikeDataProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import LikeList from "../components/LikeList";
import Loading from "../components/Loading";
import useAuth from "../services/auth.service";

export default function Likes() {
    const { _id } = useParams();
    const { infiniteScroll } = DataModifier();
    const { loading, user } = useAuth();
    
    const {
        data: likes,
        error: likesError,
        fetchNextPage: fecthMoreLikes,
        isLoading: likesLoading,
        isLoadingMore,
        isReachedEnd,
    } = infiniteScroll<LikeDataProps>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/get-all/${_id}`,
        limit: 12,
        query_key: [`likes_${_id}`],
        stale_time: 600000
    });
        
    if (loading) return (
        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
            <Loading/>
        </div>
    );

    if (!user) return (
        <div className="flex justify-center items-center h-full bg-[#1a1a1a]">
            <span className="text-[2rem] font-[600] text-purple-700">please sign in to see post</span>
        </div>
    );

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[200px] w-full bg-[#1a1a1a]">
            {likesLoading ? (
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            ) : likes ? (
                <LikeList 
                    likes={likes}
                    loadMore={isLoadingMore}
                    isReachedEnd={isReachedEnd}
                    setSize={fecthMoreLikes}
                />
            ) : likesError ? (
                <div className="flex justify-center items-center h-full">
                    <h3 className="text-purple-400 font-[500]">{likesError.message}</h3>
                </div>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <h3 className="text-purple-400 font-[500]">Failed to show likes</h3>
                </div>
            )}
            </div>
        </section>
    );
}