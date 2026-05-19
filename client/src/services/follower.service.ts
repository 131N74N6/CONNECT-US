import { useMutation, useQueryClient } from "@tanstack/react-query";
import DataModifier from "./data.service";
import type { UserConnectionStatsProps } from "../models/user-model";
import type { AddFollowerProps } from "../models/follower-model";
import AuthServices from "./auth-service";
import { useState } from "react";
import PostServices from "./post.service";

export default function FollowerServices(user_id: string) {
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();
    const { deleteData, error, getData, insertData, infiniteScroll, setError } = DataModifier();
    const { selectedPostData } = PostServices();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const { data: userConnectionStats } = getData<UserConnectionStatsProps>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/user-connection-stats/${user_id}`, 
        query_key: [`user-connection-stats-${user_id}`],
        stale_time: 1800000
    });

    const { 
        data: currentUserFollowers,
        error: currentUserFollowersError,
        isLoading: currentUserFollowersLoading,
        isReachedEnd: currentUserFollowerReachEnd, 
        isLoadingMore: loadCurrentUserFollower, 
        fetchNextPage: getMoreCurrentUserFollower, 
    } = infiniteScroll<Pick<AddFollowerProps, 'created_at' | 'user_id' | 'username'>>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/get-all/${user_id}`, 
        limit: 12,
        query_key: [`followers-${user_id}`],
        stale_time: 1800000,
    });

    const { 
        data: currentUserFollowed,
        error: currentUserFollowedError,
        isLoading: currentUserFollowedLoading,
        isReachedEnd: currentUserFollowedReachEnd, 
        isLoadingMore: loadCurrentUserFollowed, 
        fetchNextPage: getMoreCurrentUserFollowed, 
    } = infiniteScroll<Pick<AddFollowerProps, 'created_at' | 'followed_user_id' | 'followed_username'>>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/who-followed/${user_id}`, 
        limit: 12,
        query_key: [`who-followed-${user_id}`],
        stale_time: 1800000,
    });

    const followersData = { 
        currentUserFollowers, currentUserFollowersError, currentUserFollowersLoading, 
        currentUserFollowerReachEnd, loadCurrentUserFollower, getMoreCurrentUserFollower 
    }
    
    const followedData = {
        currentUserFollowed, currentUserFollowedError, currentUserFollowedLoading, 
        currentUserFollowedReachEnd, loadCurrentUserFollowed, getMoreCurrentUserFollowed
    }

    const { data: hasFollowed } = getData<boolean>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/has-followed/?user_id=${currentUserId}&followed_user_id=${user_id}`, 
        query_key: [`has-followed-${user_id}-${currentUserId}`],
        stale_time: 1800000
    });

    const notOwner = user_id && currentUserId && currentUserId !== user_id;
    const isFollowed = hasFollowed ? hasFollowed : false;

    const startFollowMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            if (!user_id || !currentUserId || !selectedPostData || !selectedPostData.selectedPost || selectedPostData.selectedPost.length === 0) return;

            const getCurrentDate = new Date();
            
            await insertData<AddFollowerProps>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    followed_user_id: user_id,
                    followed_username: selectedPostData.selectedPost[0].uploader_name,
                    user_id: currentUserId,
                    username: currentUsername
                }
            });
        },
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-connection-stats-${user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`who-followed-${user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${user_id}-${currentUserId}`] });
        },
        onSettled: () => setIsProcessing(false)
    });

    const stopFollowMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/followers/erase/${currentUserId}`);
        },
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-connection-stats-${user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`who-followed-${user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${user_id}-${currentUserId}`] });
        },
        onSettled: () => setIsProcessing(false)
    });

    return { 
        error, followedData, followersData, isFollowed, isProcessing, notOwner, 
        setError, startFollowMutation, stopFollowMutation, userConnectionStats 
    }
}