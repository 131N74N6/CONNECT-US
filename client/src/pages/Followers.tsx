import DataModifier from "../services/data-modifier";
import Loading from "../components/Loading";
import { Link, useParams } from "react-router-dom";
import type { FollowersResponseProps } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";

export default function Followers() {
    const { user_id } = useParams();
    const { infiniteScroll } = DataModifier();

    const { 
        data: currentUserFollowers,
        isReachedEnd: currentUserFollowerReachEnd, 
        isLoadingMore: loadCurrentUserFollower, 
        fetchNextPage: getMoreCurrentUserFollower, 
    } = infiniteScroll<FollowersResponseProps>({
        api_url: `http://localhost:1234/followers/get-all/${user_id}`, 
        limit: 12,
        query_key: `followers-${user_id}`,
        stale_time: 1000,
    });
    
    return (
        <section className="flex md:flex-row flex-col h-screen gap-[1rem] p-[1rem] bg-black text-white relative z-10">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col gap-[1rem] min-h-[450px] border-b border-purple-400 h-[100%] overflow-y-auto">
                {currentUserFollowers.length > 0 ? (
                    currentUserFollowers[0].followers.map(follower => (
                        <div key={`fld_${follower.user_id}`} className="bg-black p-[0.6rem] flex rounded-[0.6rem] items-center gap-[0.8rem] border border-orange-400">
                            <div className="text-white text-[1.1rem]">
                                <i className="fa-regular fa-user"></i>
                            </div>
                            <div className="flex flex-col gap-[0.5rem] text-white">
                                <Link to={`/about/${follower.user_id}`}>{follower.username}</Link>
                                <p className="text-[0.9rem]">{new Date(follower.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center h-full text-white">
                        <span className="text-center font-[550] text-[1.6rem]">No Followers</span>
                    </div>
                )}
                {loadCurrentUserFollower ? <div className="flex justify-center"><Loading/></div> : null}
                {currentUserFollowerReachEnd ? (
                    <div className="text-center">
                        <span>No Followers to Load</span>
                    </div>
                    ) : (
                    <div className="flex justify-center">
                        <button 
                            type="button"
                            disabled={loadCurrentUserFollower}
                            onClick={() => getMoreCurrentUserFollower()}
                            className="bg-pink-300 text-gray-800 w-[120px] rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}