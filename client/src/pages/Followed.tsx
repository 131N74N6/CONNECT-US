import Loading from '../components/Loading';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar1, Navbar2 } from '../components/Navbar';
import FollowerServices from '../services/follower.service';
import { useEffect } from 'react';

export default function Followed() {
    const { user_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user_id) navigate('/home');
    }, [user_id, navigate]);
    
    const { followedData, isProcessing } = FollowerServices({ user_id: user_id! });

    return (
        <section className="flex md:flex-row flex-col h-screen gap-[1rem] p-[1rem] bg-black text-white relative z-10">
            <Navbar1/>
            <div className="flex flex-col gap-[1rem] p-[1rem] min-h-[450px] bg-[#1a1a1a] md:w-3/4 w-full h-[100%] overflow-y-auto">
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        disabled={isProcessing}
                        onClick={() => navigate(`/about/${user_id}`)}
                        className="bg-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 font-medium hover:bg-amber-600 md:p-1.5 p-[0.12rem] md:w-18 w-10 rounded-lg md:text-md text-base"
                    >
                        Back
                    </button>
                </div>
                {followedData.currentUserFollowed.length > 0 ? (
                    followedData.currentUserFollowed.map(followed => (
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
                        <span className="text-center font-[550] text-[1.6rem]">No Followed Users</span>
                    </div>
                )}
                {followedData.loadCurrentUserFollowed ? <div className="flex justify-center"><Loading/></div> : null}
                {followedData.currentUserFollowed.length < 12 ? (
                    <></>
                ) : followedData.currentUserFollowedReachEnd ? (
                    <div className="text-center">
                        <span>No Followed Users to Load</span>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button 
                            type="button"
                            disabled={isProcessing}
                            onClick={() => followedData.getMoreCurrentUserFollowed()}
                            className="bg-pink-300 text-gray-800 w-[120px] rounded font-[500] cursor-pointer p-[0.4rem] text-[0.9rem] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
            <Navbar2/>
        </section>
    );
}
