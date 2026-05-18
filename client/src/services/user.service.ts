import { Query, useMutation, useQueryClient } from "@tanstack/react-query";
import AuthServices from "./auth-service";
import DataModifier from "./data.service";
import { useNavigate } from "react-router-dom";
import type { CurrentUserIntrf } from "../models/user-model";
import { useEffect, useState } from "react";

export default function UserServices() {
    const { currentUserId, signOut } = AuthServices();
    const { deleteData, getData, updateData } = DataModifier();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');

    const { data: userData, isLoading: isUserDataLoading, error: userDataError } =  getData<CurrentUserIntrf>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/users/profile/${currentUserId}`, 
        query_key: [`signed-in-user-${currentUserId}`], 
        stale_time: 1800000
    });

    useEffect(() => {
        if (userData) setUsername(userData.username);
    }, [userData, currentUserId]);


    const changeProfileMutation = useMutation({
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
            queryClient.invalidateQueries({ queryKey: [`signed-in-user-${currentUserId}`] });
        },
        onSettled: () => setIsProcessing(false),
    });

    const deleteAccountMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/users/delete_user/${currentUserId}`);
        },
        onError: () => {},
        onSuccess: () => {
            queryClient.removeQueries({
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

    const deleteAllPostMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!currentUserId || !window.confirm('Are you sure you want to delete this post?')) return;
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/posts/erase-all/${currentUserId}`);
        }, 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-posts'] });
            queryClient.removeQueries({
                predicate: (query: Query<unknown, Error, unknown, readonly unknown[]>) => {
                    const queryKey = query.queryKey;
                    if (Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string') {
                        return queryKey[0].startsWith(`like_`) || queryKey[0].startsWith(`comments-`) || 
                        queryKey[0].startsWith(`user-post-total-`) || queryKey[0].startsWith(`user-connection-stats-`);
                    }
                    return false;
                }
            });
            queryClient.invalidateQueries({ queryKey: ['signed-user-posts'] });
            navigate(`/about/${currentUserId}`);
        },
        onError: () => {},
        onSettled: () => setIsProcessing(false)
    });

    return { changeProfileMutation, deleteAllPostMutation, deleteAccountMutation, isProcessing, isUserDataLoading, userDataError, userData, isEditing, setIsEditing, username, setUsername };
}