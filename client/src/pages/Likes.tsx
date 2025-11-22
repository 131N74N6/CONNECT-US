import { useParams } from "react-router-dom";
import DataModifier from "../services/data-modifier";
import type { LikeDataProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import LikeList from "../components/LikeList";
import Loading from "../components/Loading";

export default function Likes() {
    const { _id } = useParams();
    const { infiniteScroll } = DataModifier();

    const {
        data: likes,
        error: likesError,
        fetchNextPage: fecthMoreLikes,
        isLoading: likesLoading,
        isLoadingMore,
        isReachedEnd,
    } = infiniteScroll<LikeDataProps>({
        api_url: `http://localhost:1234/likes/get-all/${_id}`,
        limit: 12,
        query_key: `likes_${_id}`,
        stale_time: 600000
    });

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