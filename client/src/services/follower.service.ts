import { useMutation, useQueryClient } from "@tanstack/react-query";
import DataModifier from "./data.service";
import type { UserConnectionStatsProps } from "../models/user_model";
import type { AddFollowerProps, IFollowerService } from "../models/follower_model";
import AuthServices from "./auth.service";
import { useState } from "react";

export default function FollowerServices(props?: IFollowerService) {
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();
    const { deleteData, getData, insertData, infiniteScroll } = DataModifier();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const { data: userConnectionStats } = getData<UserConnectionStatsProps>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/user-connection-stats/${props?.user_id}`, 
        query_key: [`user-connection-stats-${props?.user_id}`],
        query_params: !!props?.user_id,
        stale_time: Infinity
    });

    const { 
        data: currentUserFollowers,
        error: currentUserFollowersError,
        isLoading: currentUserFollowersLoading,
        isReachedEnd: currentUserFollowerReachEnd, 
        isLoadingMore: loadCurrentUserFollower, 
        fetchNextPage: getMoreCurrentUserFollower, 
    } = infiniteScroll<Pick<AddFollowerProps, 'created_at' | 'user_id' | 'username'>>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/get-all/${props?.user_id}`, 
        limit: 12,
        query_key: [`followers-${props?.user_id}`],
        query_params: !!props?.user_id,
        stale_time: Infinity,
    });

    const { 
        data: currentUserFollowed,
        error: currentUserFollowedError,
        isLoading: currentUserFollowedLoading,
        isReachedEnd: currentUserFollowedReachEnd, 
        isLoadingMore: loadCurrentUserFollowed, 
        fetchNextPage: getMoreCurrentUserFollowed, 
    } = infiniteScroll<Pick<AddFollowerProps, 'created_at' | 'followed_user_id' | 'followed_username'>>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/who-followed/${props?.user_id}`, 
        limit: 12,
        query_key: [`who-followed-${props?.user_id}`],
        query_params: !!props?.user_id,
        stale_time: Infinity,
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
        api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/has-followed/?user_id=${currentUserId}&followed_user_id=${props?.user_id}`, 
        query_key: [`has-followed-${props?.user_id}-${currentUserId}`],
        query_params: !!props?.user_id && !!currentUserId,
        stale_time: Infinity
    });

    const notOwner = props?.user_id && currentUserId && currentUserId !== props?.user_id;
    const isFollowed = hasFollowed ? hasFollowed : false;

    const startFollowMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async (uploader_name: string) => {
            if (!props?.user_id || !currentUserId) return;
            
            await insertData<AddFollowerProps>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/followers/add`,
                data: {
                    created_at: new Date().toISOString(),
                    followed_user_id: props?.user_id,
                    followed_username: uploader_name,
                    user_id: currentUserId,
                    username: currentUsername
                }
            });
        },
        onError: (error) => {
            props?.set_message!(error.message || 'Failed to follow user. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-connection-stats-${props?.user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${props?.user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`who-followed-${props?.user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${props?.user_id}-${currentUserId}`] });
        },
        onSettled: () => setIsProcessing(false)
    });

    const stopFollowMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/followers/erase/${currentUserId}`);
        },
        onError: (error) => {
            props?.set_message!(error.message || 'Failed to unfollow user. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-connection-stats-${props?.user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${props?.user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`who-followed-${props?.user_id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${props?.user_id}-${currentUserId}`] });
        },
        onSettled: () => setIsProcessing(false)
    });

    return { 
        followedData, followersData, isFollowed, isProcessing, notOwner, 
        startFollowMutation, stopFollowMutation, userConnectionStats 
    }
}