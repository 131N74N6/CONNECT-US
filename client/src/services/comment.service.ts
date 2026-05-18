import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import DataModifier from "./data.service";
import AuthServices from "./auth-service";
import type { PostDetail } from "../models/post-model";
import type { CommentIntrf } from "../models/comment-model";

export default function CommentServices(id?: string) {
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();

    const { error, getData, insertData, infiniteScroll, setError } = DataModifier();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [comment, setComment] = useState<string>('');

    const {
        data: commentsData,
        isLoading: commentsLoading,
        error: commentsError,
        isReachedEnd: commentsReachedEnd,
        isLoadingMore: loadMoreComments,
        fetchNextPage: fetchMoreComments,
    } =  infiniteScroll<Pick<CommentIntrf, 'created_at' | 'username' | 'opinions'>>({
        api_url: id ? `${import.meta.env.VITE_API_BASE_URL}/comments/get-all/${id}` : ``, 
        limit: 12,
        stale_time: 1800000,
        query_key: [`comments-${id}`]
    });

    const allCommentsData = { commentsData, commentsLoading, commentsError, commentsReachedEnd, loadMoreComments, fetchMoreComments }

    const { data: commentsTotal } = getData<number>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/comments/comment-total/${id}`, 
        query_key: [`comments-total-${id}`],
        stale_time: 1800000
    });

    const commentMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async (selectedPost: PostDetail[] | undefined) => {
            const getCurrentDate = new Date();

            if (!currentUserId || !comment.trim() || !id || !selectedPost) return;
            console.log(selectedPost);
            console.log(id);
            console.log(currentUserId);

            await insertData<CommentIntrf>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/comments/add`,
                data: {
                    created_at: getCurrentDate.toISOString(),
                    opinions: comment.trim(),
                    post_id: id,
                    user_id: currentUserId,
                    username: currentUsername,
                    post_owner_id: selectedPost?.[0]?.user_id
                }
            });
        },
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`comments-${id}`] });
            queryClient.invalidateQueries({ queryKey: [`comments-total-${id}`] });
        },
        onSettled: () => {
            setComment('');
            setIsProcessing(false);
        },
    });

    return { allCommentsData, comment, commentMutation, commentsTotal, currentUserId, currentUsername, error, isProcessing, queryClient, setComment, setError }
}