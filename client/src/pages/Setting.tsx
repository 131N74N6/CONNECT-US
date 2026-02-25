import DataModifier from "../services/data.service";
import useAuth from "../services/auth.service";
import type { IUserInfo } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Setting() {
    const { user } = useAuth();
    const { deleteData, getData } = DataModifier();
    const queryQlient = useQueryClient();
    const navigate = useNavigate();

    const [isDeleteing, setIsDeleting] = useState<boolean>(false);
    const getUserId = user ? user.info.id : '';

    const { data: userData } =  getData<IUserInfo[]>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/users/selected/${getUserId}`, 
        query_key: ['signed-in-user'], 
        stale_time: 660000
    });

    const deleteAllPostMutation = useMutation({
        onMutate: () => setIsDeleting(true),
        mutationFn: async () => {
            if (!user || !window.confirm('Are you sure you want to delete this post?')) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-all/${getUserId}`);
        }, onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: ['all-posts'] });
            queryQlient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            navigate(`/about/${getUserId}`);
        },
        onSettled: () => setIsDeleting(false)
    });

    const deleteAllSignedUserPosts = () => deleteAllPostMutation.mutate();

    return (
        <section className="h-screen flex md:flex-row flex-col gap-[1rem] p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4 h-full">
                <div className="flex flex-col gap-[1rem]">
                    <p className="text-purple-400 font-[500] text-[1rem]">Email: {userData?.[0]?.email}</p>
                    <p className="text-purple-400 font-[500] text-[1rem]">Username: {userData?.[0]?.username}</p>
                    <div className="flex gap-[0.4rem]">
                        <button 
                            type="button"
                            disabled={isDeleteing}
                            onClick={deleteAllSignedUserPosts}
                            className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                        >
                            Delete All Posts
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}