import { Navbar1, Navbar2 } from "../components/Navbar";
import Loading from "../components/Loading";
import UserServices from "../services/user.service";

export default function Setting() {
    const { 
        changeProfileMutation, deleteAllPostMutation, deleteAccountMutation, isProcessing, 
        isUserDataLoading, userDataError, userData, isEditing, setIsEditing, username, setUsername 
    } = UserServices();

    return (
        <section className="h-screen flex md:flex-row flex-col gap-[1rem] p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4 h-full">
                {isUserDataLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loading/>
                    </div>
                ) : userDataError ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-red-500">Error loading user data</p>
                    </div>
                ) : isEditing ? (
                        <div className="flex flex-col gap-4">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    changeProfileMutation.mutate();
                                }}
                                className="flex flex-col gap-2.5"
                            >
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border border-blue-300 text-blue-300 rounded p-2.5 md:text-lg text-base outline-0 bg-transparent"
                                />
                                <p className="text-purple-400 font-[500] text-[1rem]">User ID: {userData?.user_id}</p>
                                <p className="text-purple-400 font-[500] text-[1rem]">Username: {userData?.username}</p>
                                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[0.4rem]">
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => setIsEditing(false)}
                                        className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                ) : (
                    <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4 h-full">
                        <div className="flex flex-col gap-[1rem]">
                            <p className="text-purple-400 font-[500] text-[1rem]">Email: {userData?.email}</p>
                            <p className="text-purple-400 font-[500] text-[1rem]">User ID: {userData?.user_id}</p>
                            <p className="text-purple-400 font-[500] text-[1rem]">Username: {userData?.username}</p>
                            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[0.4rem]">
                                <button 
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => deleteAllPostMutation.mutate()}
                                    className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                                    >
                                    Delete All Posts
                                </button>
                                <button 
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => deleteAccountMutation.mutate()}
                                    className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                                    >
                                    Delete Account
                                </button>
                                <button 
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => setIsEditing(true)}
                                    className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                                    >
                                    Change Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}