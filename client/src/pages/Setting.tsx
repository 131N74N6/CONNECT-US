import useSWR from "swr";
import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { IUserInfo } from "../services/custom-types";
import { useEffect, useState } from "react";
import { Navbar1, Navbar2 } from "../components/Navbar";

export default function Setting() {
    const { user } = useAuth();
    const { deleteData, getData, updateData } = DataModifier();
    const [newUsername, setNewUsername] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    
    const { data: userData, mutate: mutateUserData } = useSWR<IUserInfo[]>(
        user ? `http://localhost:1234/users/selected/${user.info.id}` : '',
        getData
    );

    useEffect(() => {
        if (isEditing) {
            setNewUsername(userData ? userData[0].username : '');
        } else {
            setNewUsername('');
        }
    }, [isEditing]);

    const updateUser = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedUserName = newUsername.trim();
        if (!user || !trimmedUserName) return;

        await updateData<IUserInfo>({
            api_url: `http://localhost:1234/users/change/${user.info.id}`,
            data: {
                username: trimmedUserName
            }
        });

        mutateUserData();
        setIsEditing(false);
    }

    const deleteAllSignedUserPosts = async () => {
        if (!user) return;
        await deleteData(`http://localhost:1234/posts/erase-all/${user.info.id}`);
    }

    return (
        <div className="h-screen flex md:flex-row flex-col gap-[1rem] p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4">
                {isEditing ? (
                    <form onSubmit={updateUser} className="flex flex-col gap-[1rem]">
                        <input 
                            type="text" 
                            placeholder="ex: John" 
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewUsername(event.target.value)}
                            value={newUsername}
                            className="outline-0 border border-purple-400 p-[0.4rem] text-[0.9rem] font-[500] text-purple-400"
                        />
                        <div className="flex gap-[0.4rem]">
                            <button 
                                type="submit"
                                className="outline-0 cursor-pointer bg-purple-400 p-[0.4rem] text-[0.9rem] font-[500] text-gray-800"
                            >
                                Save
                            </button>
                            <button 
                                type="button" 
                                className="outline-0 cursor-pointer bg-purple-400 p-[0.4rem] text-[0.9rem] font-[500] text-gray-800"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col gap-[1rem]">
                        <p className="text-purple-400 font-[500] text-[1rem]">Email: {userData && userData[0].email}</p>
                        <p className="text-purple-400 font-[500] text-[1rem]">Username: {userData && userData[0].username}</p>
                        <div className="flex gap-[0.4rem]">
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(true)} 
                                className="bg-purple-400 cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                            >
                                Edit
                            </button>
                            <button 
                                type="button"
                                onClick={deleteAllSignedUserPosts}
                                className="bg-purple-400 cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                            >
                                Delete All Posts
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}