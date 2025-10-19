import DataModifier from '../services/data-modifier';
import Loading from '../components/Loading';
import { Link, useParams } from 'react-router-dom';
import type { AddFollowerProps } from '../services/custom-types';
import { Navbar1, Navbar2 } from '../components/Navbar';

export default function Followed() {
    const { user_id } = useParams();
    const { infiniteScroll } = DataModifier();
    
    const { 
        data: currentUserFollowed,
        isReachedEnd: currentUserFollowedReachEnd, 
        isLoadingMore: loadCurrentUserFollowed, 
        fetchNextPage: getMoreCurrentUserFollowed, 
    } = infiniteScroll<Pick<AddFollowerProps, 'created_at' | 'followed_user_id' | 'followed_username'>>({
        api_url: `http://localhost:1234/followers/who-followed/${user_id}`, 
        limit: 12,
        query_key: `who-followed-${user_id}`,
        stale_time: 1000,
    });

    return (
        <section className="flex md:flex-row flex-col h-screen gap-[1rem] p-[1rem] bg-black text-white relative z-10">
            <Navbar1/>
            <Navbar2/>
            <div className="flex flex-col gap-[1rem] p-[1rem] min-h-[450px] bg-[#1a1a1a] md:w-3/4 w-full h-[100%] overflow-y-auto">
                {currentUserFollowed.length > 0 ? (
                    currentUserFollowed.map(followed => (
                        <div key={`fld_${followed.followed_user_id}`} className="bg-black p-[0.6rem] flex rounded-[0.6rem] items-center gap-[0.8rem] border border-orange-400">
                            <div className="text-white text-[1.1rem]">
                                <i className="fa-regular fa-user"></i>
                            </div>
                            <div className="flex flex-col gap-[0.5rem] text-white">
                                <Link to={`/about/${followed.followed_user_id}`}>{followed.followed_username}</Link>
                                <p className="text-[0.9rem]">{new Date(followed.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-center items-center h-full text-white">
                        <span className="text-center font-[550] text-[1.6rem]">No Followers</span>
                    </div>
                )}
                {loadCurrentUserFollowed ? <div className="flex justify-center"><Loading/></div> : null}
                {currentUserFollowedReachEnd ? (
                    <div className="text-center">
                        <span>No Followers to Load</span>
                    </div>
                    ) : (
                    <div className="flex justify-center">
                        <button 
                            type="button"
                            disabled={loadCurrentUserFollowed}
                            onClick={() => getMoreCurrentUserFollowed()}
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
