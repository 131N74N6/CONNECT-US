import { useParams } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import LikeList from "../components/LikeList";
import Loading from "../components/Loading";
import LikeServices from "../services/like.service";

export default function Likes() {
    const { _id } = useParams();
    const id = _id ? _id : '';
    const { allLikesData } = LikeServices(id);

    return (
        <section className="flex gap-[1rem] md:flex-row flex-col h-screen p-[1rem] bg-black">
            <Navbar1/>
            <div className="flex flex-col p-[1rem] gap-[1rem] md:w-3/4 h-[100%] min-h-[200px] w-full bg-[#1a1a1a]">
            {allLikesData.likesDataLoading ? (
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            ) : allLikesData.likesData ? (
                <LikeList 
                    likes={allLikesData.likesData}
                    loadMore={allLikesData.likesIsLoadMore}
                    isReachedEnd={allLikesData.likesDataReachedEnd}
                    setSize={allLikesData.fecthMoreLikes}
                />
            ) : allLikesData.likesDataError ? (
                <div className="flex justify-center items-center h-full">
                    <h3 className="text-purple-400 font-[500]">{allLikesData.likesDataError.message}</h3>
                </div>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <h3 className="text-purple-400 font-[500]">Failed to show likes</h3>
                </div>
            )}
            </div>
            <Navbar2/>
        </section>
    );
}