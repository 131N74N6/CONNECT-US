import DataModifier from "../services/data-modifier";
import useAuth from "../services/useAuth";
import type { IUserInfo } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function Setting() {
    const { user } = useAuth();
    const { deleteData, getData } = DataModifier();
    const queryQlient = useQueryClient();

    const getUserId = user ? user.info.id : '';
    const { data: userData } =  getData<IUserInfo[]>(`http://localhost:1234/users/selected/${getUserId}`, ['signed-in-user']);

    const deleteAllPostMutation = useMutation({
        mutationFn: async () => {
            if (!user || !window.confirm('Are you sure you want to delete this post?')) return;
            await deleteData(`http://localhost:1234/posts/erase-all/${user.info.id}`);
        }, onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: ['all-posts'] });
            queryQlient.invalidateQueries({ queryKey: ['signed-user-posts'] });
        }
    });

    const deleteAllSignedUserPosts = () => deleteAllPostMutation.mutate();

    return (
        <div className="h-screen flex md:flex-row flex-col gap-[1rem] p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4 h-full">
                <div className="flex flex-col gap-[1rem]">
                    <p className="text-purple-400 font-[500] text-[1rem]">Email: {userData ? userData.data[0].email : ''}</p>
                    <p className="text-purple-400 font-[500] text-[1rem]">Username: {userData ? userData.data[0].username : ''}</p>
                    <div className="flex gap-[0.4rem]">
                        <button 
                            type="button"
                            onClick={deleteAllSignedUserPosts}
                            className="bg-purple-400 cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                        >
                            Delete All Posts
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}