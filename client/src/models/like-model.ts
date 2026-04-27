import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";

export type LikeDataProps = {
    _id: string;
    created_at: string;
    post_id: string;
    post_owner_id: string;
    user_id: string;
    username: string;
}

export type LikeListProps = {
    likes: Pick<LikeDataProps, 'created_at' | 'user_id' | 'username'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    setSize: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
}