import DataModifier from "../services/data.service";
import useAuth from "../services/auth.service";
import type { IUserInfo } from "../services/custom-types";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Loading from "../components/Loading";

export default function Setting() {
    const { currentUserId } = useAuth();
    const { deleteData, getData } = DataModifier();
    const queryQlient = useQueryClient();
    const navigate = useNavigate();

    const [isDeleteing, setIsDeleting] = useState<boolean>(false);

    const { data: userData, isLoading, error } =  getData<IUserInfo>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/users/profile/${currentUserId}`, 
        query_key: ['signed-in-user'], 
        stale_time: 660000
    });

    const deleteAllPostMutation = useMutation({
        onMutate: () => setIsDeleting(true),
        mutationFn: async () => {
            if (!currentUserId || !window.confirm('Are you sure you want to delete this post?')) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-all/${currentUserId}`);
        }, onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: ['all-posts'] });
            queryQlient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            navigate(`/about/${currentUserId}`);
        },
        onSettled: () => setIsDeleting(false)
    });

    return (
        <section className="h-screen flex md:flex-row flex-col gap-[1rem] p-[1rem] bg-black">
            <Navbar1/>
            <Navbar2/>
            {isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <Loading/>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-red-500">Error loading user data</p>
                </div>
            ) : (
                <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4 h-full">
                    <div className="flex flex-col gap-[1rem]">
                        <p className="text-purple-400 font-[500] text-[1rem]">Email: {userData?.email}</p>
                        <p className="text-purple-400 font-[500] text-[1rem]">Username: {userData?.username}</p>
                        <div className="flex gap-[0.4rem]">
                            <button 
                                type="button"
                                disabled={isDeleteing}
                                onClick={() => deleteAllPostMutation.mutate()}
                                className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                            >
                                Delete All Posts
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}