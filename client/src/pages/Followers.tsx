import Loading from "../components/Loading";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Navbar1, Navbar2 } from "../components/Navbar";
import FollowerServices from "../services/follower.service";
import { useEffect } from "react";

export default function Followers() {
    const { user_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user_id) navigate('/home');
    }, [user_id, navigate]);

    const { followersData, isProcessing } = FollowerServices(user_id!);
    
    return (
        <section className="flex md:flex-row flex-col h-screen gap-[1rem] p-[1rem] bg-black text-white relative z-10">
            <Navbar1/>
            <div className="flex flex-col gap-[1rem] p-[1rem] min-h-[450px] bg-[#1a1a1a] md:w-3/4 w-full h-[100%] overflow-y-auto">
                {followersData.currentUserFollowers.length > 0 ? (
                    followersData.currentUserFollowers.map(follower => (
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
                {followersData.loadCurrentUserFollower ? <div className="flex justify-center"><Loading/></div> : null}
                {followersData.currentUserFollowers.length < 12 ? (
                    <></>
                ) : followersData.currentUserFollowerReachEnd ? (
                    <div className="text-center">
                        <span>No Followers to Load</span>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button 
                            type="button"
                            disabled={isProcessing}
                            onClick={() => followersData.getMoreCurrentUserFollower()}
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