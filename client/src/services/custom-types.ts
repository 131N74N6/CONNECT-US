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

export type ILikes = {
    _id: string;
    created_at: string;
    post_id: string;
    post_owner_id: string;
    user_id: string;
    username: string;
}

export type LikesData = {
    likes: Pick<ILikes, 'created_at' | 'user_id' | 'username'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    size: number;
    setSize: (size: number | ((_size: number) => number)) => Promise<any[] | undefined>;
    onClose: (value: React.SetStateAction<boolean>) => void
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

export type PostResponseProps = {
    posts: PostItemProps[];
    total_post: number;
}

export type CommentProps = {
    comments_data: IComments[];
    comment: string;
    sendComment: (event: React.FormEvent) => void;
    setComment: (value: React.SetStateAction<string>) => void
    onClose: (value: React.SetStateAction<boolean>) => void
    isReachedEnd: boolean;
    loadMore: boolean;
    setSize: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
    isSendComment: boolean;
}

export type AddFollowerProps = {
    _id: string;
    created_at: string;
    followed_user_id: string;
    followed_username: string;
    user_id: string;
    username: string;
}

export type FollowersDataProps = {
    followers: Pick<AddFollowerProps, 'created_at' | 'user_id' | 'username'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    setSize: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
    onClose: (value: React.SetStateAction<boolean>) => void;
}

export type FollowedDataProps = {
    followed: Pick<AddFollowerProps, 'created_at' | 'followed_user_id' | 'followed_username'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    setSize: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
    onClose: (value: React.SetStateAction<boolean>) => void;
}

export type FollowersResponseProps = {
    followers: AddFollowerProps[];
    follower_total: number; 
}

export type FollowedResponseProps = {
    followed: AddFollowerProps[];
    followed_total: number; 
}