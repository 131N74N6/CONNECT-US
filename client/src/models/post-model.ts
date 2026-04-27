import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";

export type PostItemProps = {
    _id: string;
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

export type MediaFile = {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    publicId?: string;
}

export type PostDetail = {
    _id: string;
    created_at: string;
    description: string;
    uploader_name: string;
    posts_file?: { file_url: string; public_id: string; }[];
    user_id: string;
}