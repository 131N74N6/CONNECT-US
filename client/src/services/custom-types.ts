import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";

export type IPostData<T> = {
    api_url: string;
    data: Omit<T, '_id'>;
}

export type InfiniteScrollProps = {
    api_url: string; 
    limit: number; 
    query_key: string;
    stale_time: number;
}

export type IGetData = {
    api_url: string; 
    query_key: string[];
    stale_time: number;
}

export type IPutData<T> = {
    api_url: string;
    data: Partial<Omit<T, '_id'>>;
}

export type MediaFile = {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    publicId?: string;
}

export type User = {
    status: string;
    token: string;
    info: {
        id: string;
        email: string;
        username: string;
    }
}

export type IUserInfo = {
    _id: string;
    email: string;
    username: string;
}

export type LikeDataProps = {
    _id: string;
    created_at: string;
    post_id: string;
    post_owner_id: string;
    user_id: string;
    username: string;
}

export type LikeListProps = {
    likes: Pick<LikeDataProps, 'created_at' | 'user_id' | 'username' | 'post_id'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    setSize: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
}

export type IComments = {
    _id: string;
    created_at: string;
    opinions: string;
    post_id: string;
    post_owner_id: string;
    user_id: string;
    username: string;
}

export type PostItemProps = {
    _id: string;
    description: string;
    uploader_name: string;
    posts_file?: { file_url: string; public_id: string; }[];
    user_id: string;
}

export type PostDetail = {
    _id: string;
    created_at: string;
    description: string;
    uploader_name: string;
    posts_file?: { file_url: string; public_id: string; }[];
    user_id: string;
}

export type PostListProps = {
    data: PostItemProps[];
    isReachedEnd: boolean;
    loadMore: boolean;
    setSize: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
}

export type SearchedPost = {
    api_url: string;
    limit: number;
    query_key: string[];
    searched: string;
    stale_time: number;
}

export type AddFollowerProps = {
    _id: string;
    created_at: string;
    followed_user_id: string;
    followed_username: string;
    user_id: string;
    username: string;
}

export type UserConnectionStatsProps = {
    followed_total: number;
    follower_total: number;
}