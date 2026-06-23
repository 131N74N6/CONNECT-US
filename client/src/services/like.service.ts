import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthServices from "./auth.service";
import type { ILikeService, LikeDataProps } from "../models/like_model";
import DataModifier from "./data.service";
import { useState } from "react";
import type { PostDetail } from "../models/post_model";

export default function LikeServices(props?: ILikeService) {
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const { deleteData, getData, insertData, infiniteScroll } = DataModifier();

    const { data: likesTotal } = getData<number>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/likes-total/${props?.id}`, 
        query_key: [`likes-total-${props?.id}`],
        stale_time: Infinity
    });
    
    const { data: hasUserLiked } = getData<boolean>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/has-liked?post_id=${props?.id}&user_id=${currentUserId}`, 
        query_key: [`has-liked-${props?.id}-${currentUserId}`],
        stale_time: Infinity
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
        api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/get-all/${props?.id}`,
        limit: 12,
        query_key: [`likes-${props?.id}`],
        stale_time: Infinity
    });

    const allLikesData = { likesData, likesDataError, fecthMoreLikes, likesDataLoading, likesIsLoadMore, likesDataReachedEnd }
    
    const giveLikeMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async (selectedPost: PostDetail[] | undefined) => {
            const getCurrentDate = new Date();
            if (!currentUserId || !props?.id || !selectedPost) return;

            await insertData<LikeDataProps>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/likes/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    post_id: props?.id,
                    user_id: currentUserId,
                    username: currentUsername,
                    post_owner_id: selectedPost[0].user_id
                }
            });
        },
        onError: (error) => {
            props?.set_message!(error.message || 'Failed to give like. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${props?.id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${props?.id}-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${props?.id}`] });
        },
        onSettled: () => setIsProcessing(false),
    });

    const startDislikeMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async () => {
            await deleteData(`${import.meta.env.VITE_API_BASE_URL}/likes/erase/${currentUserId}`);
        },
        onError: (error) => {
            props?.set_message!(error.message || 'Failed to remove like. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`likes-${props?.id}`] });
            queryClient.invalidateQueries({ queryKey: [`has-liked-${props?.id}-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`likes-total-${props?.id}`] });
        },
        onSettled: () => setIsProcessing(false),
    });

    return { allLikesData, giveLikeMutation, hasUserLiked, isProcessing, isLiked, likesTotal, startDislikeMutation }
}