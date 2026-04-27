import DataModifier from "../services/data-service";
import useAuth from "../services/auth-service";
import type { CurrentUserIntrf } from "../models/user-model";
import { Navbar1, Navbar2 } from "../components/Navbar";
import { Query, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";

export default function Setting() {
    const { currentUserId } = useAuth();
    const { deleteData, getData, updateData } = DataModifier();
    const queryQlient = useQueryClient();
    const navigate = useNavigate();

    const { signOut } = useAuth();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');

    const { data: userData, isLoading, error } =  getData<CurrentUserIntrf>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/users/profile/${currentUserId}`, 
        query_key: ['signed-in-user'], 
        stale_time: 660000
    });

    useEffect(() => {
        if (userData) setUsername(userData.username);
    }, [userData, currentUserId]);


    const changeProfileMt = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!currentUserId) return;
            await updateData({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/users/change/${currentUserId}`,
                data: username.trim()
            });
        },
        onError: () => {},
        onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: ['signed-in-user'] });
        },
        onSettled: () => setIsProcessing(false),
    });

    const deleteAccountMt = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/users/delete_user/${currentUserId}`);
        },
        onError: () => {},
        onSuccess: () => {
            queryQlient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith(`like_`) || queryKey[0].startsWith(`comments-`) || 
                        queryKey[0].startsWith(`signed-user-posts-`) || queryKey[0].startsWith(`has-followed-`) ||
                        queryKey[0].startsWith(`user-connection-stats-`) || queryKey[0].startsWith(`user-post-total-`);
                    }
                    return false;
                }
            });
            signOut(navigate);
        },
        onSettled: () => setIsProcessing(false),
    });

    const deleteAllPostMt = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!currentUserId || !window.confirm('Are you sure you want to delete this post?')) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-all/${currentUserId}`);
        }, 
        onSuccess: () => {
            queryQlient.invalidateQueries({ queryKey: ['all-posts'] });
            queryQlient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith(`like_`) || queryKey[0].startsWith(`comments-`) || 
                        queryKey[0].startsWith(`user-post-total-`) || queryKey[0].startsWith(`user-connection-stats-`);
                    }
                    return false;
                }
            });
            queryQlient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            navigate(`/about/${currentUserId}`);
        },
        onError: () => {},
        onSettled: () => setIsProcessing(false)
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
            ) : isEditing ? (
                <div className="flex justify-center p-[1rem] gap-[1rem] bg-[#1a1a1a] w-full md:w-3/4 h-full">
                    <div className="flex flex-col gap-4">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                changeProfileMt.mutate();
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
                                onClick={() => deleteAllPostMt.mutate()}
                                className="bg-purple-400 w-[150px] cursor-pointer font-[500] text-gray-800 text-[0.9rem] p-[0.4rem]"
                            >
                                Delete All Posts
                            </button>
                            <button 
                                type="button"
                                disabled={isProcessing}
                                onClick={() => deleteAccountMt.mutate()}
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
        </section>
    );
}