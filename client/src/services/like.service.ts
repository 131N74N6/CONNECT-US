import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthServices from "./auth.service";
import type { LikeDataProps } from "../models/like_model";
import DataModifier from "./data.service";
import { useState } from "react";
import type { PostDetail } from "../models/post_model";

export default function LikeServices(id: string) {
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const { deleteData, getData, insertData, infiniteScroll, setError } = DataModifier();

    const { data: likesTotal } = getData<number>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/likes-total/${id}`, 
        query_key: [`likes-total-${id}`],
        stale_time: 1800000
    });
    
    const { data: hasUserLiked } = getData<boolean>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/has-liked?post_id=${id}&user_id=${currentUserId}`, 
        query_key: [`has-liked-${id}-${currentUserId}`],
        stale_time: 1800000
    });

    const isLiked = hasUserLiked ? hasUserLiked : false;

    const {
        data: likesData,
        error: likesDataError,
        fetchNextPage: fecthMoreLikes,
        isLoading: likesDataLoading,
        isLoadingMore: likesIsLoadMore,
        isReachedEnd: likesDataReachedEnd,
    } = infiniteScroll<LikeDataProps>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/get-all/${id}`,
        limit: 12,
        query_key: [`likes-${id}`],
        stale_time: 1800000
    });

    const allLikesData = { likesData, likesDataError, fecthMoreLikes, likesDataLoading, likesIsLoadMore, likesDataReachedEnd }
    
    const giveLikeMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async (selectedPost: PostDetail[] | undefined) => {
            const getCurrentDate = new Date();
            if (!currentUserId || !id || !selectedPost) return;

            await insertData<LikeDataProps>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    post_id: id,
                    user_id: currentUserId,
                    username: currentUsername,
                    post_owner_id: selectedPost[0].user_id
                }
            });
        },
        onError: (error) => {
            setError(error.message || 'Failed to give like. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${id}-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${id}`] });
        },
        onSettled: () => setIsProcessing(false),
    });

    const startDislikeMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/likes/erase/${currentUserId}`);
        },
        onError: (error) => {
            setError(error.message || 'Failed to remove like. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${id}-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${id}`] });
        },
        onSettled: () => setIsProcessing(false),
    });

    return { allLikesData, giveLikeMutation, hasUserLiked, isProcessing, isLiked, likesTotal, startDislikeMutation }
}