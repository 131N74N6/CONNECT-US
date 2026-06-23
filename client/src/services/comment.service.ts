import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import DataModifier from "./data.service";
import AuthServices from "./auth.service";
import type { PostDetail } from "../models/post_model";
import type { CommentIntrf, ICommentService } from "../models/comment_model";

export default function CommentServices(props?: ICommentService) {
    const queryClient = useQueryClient();
    const { currentUserId, currentUsername } = AuthServices();

    const { getData, insertData, infiniteScroll } = DataModifier();
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
        api_url: props?._id ? `${import.meta.env.VITE_API_BASE_URL}/comments/get-all/${props?._id}` : ``, 
        limit: 12,
        stale_time: 1800000,
        query_params: !!props?._id,
        query_key: [`comments-${props?._id}`]
    });

    const allCommentsData = { commentsData, commentsLoading, commentsError, commentsReachedEnd, loadMoreComments, fetchMoreComments }

    const { data: commentsTotal } = getData<number>({
        api_url: `${import.meta.env.VITE_API_BASE_URL}/comments/comment-total/${props?._id}`, 
        query_key: [`comments-total-${props?._id}`],
        query_params: !!props?._id,
        stale_time: 1800000
    });

    const commentMutation = useMutation({
        onMutate: () => setIsProcessing(true),
        mutationFn: async (selectedPost: PostDetail[] | undefined) => {
            if (!currentUserId || !comment.trim() || !props?._id || !selectedPost) return;

            await insertData<CommentIntrf>({
                api_url: `${import.meta.env.VITE_API_BASE_URL}/comments/add`,
                data: {
                    created_at: new Date().toISOString(),
                    opinions: comment.trim(),
                    post_id: props?._id,
                    user_id: currentUserId,
                    username: currentUsername,
                    post_owner_id: selectedPost?.[0]?.user_id
                }
            });
        },
        onError: (error) => {
            props?.set_message(error.message || 'Failed to add comment. Try again later');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`comments-${props?._id}`] });
            queryClient.invalidateQueries({ queryKey: [`comments-total-${props?._id}`] });
        },
        onSettled: () => {
            setComment('');
            setIsProcessing(false);
        },
    });

    return { allCommentsData, comment, commentMutation, commentsTotal, currentUserId, currentUsername, isProcessing, queryClient, setComment }
}