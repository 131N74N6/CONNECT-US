import type { OrderByDirection, WhereFilterOp } from "firebase/firestore";

export type IInfiniteScroll = {
    collection_name: string; 
    filters?: [string, WhereFilterOp, any][]; 
    order_by_options?: [string, OrderByDirection][]; 
    page_size: number;
}

export type InsertDataProps<T> = {
    collectionName: string; 
    data: Omit<T, 'id' | 'created_at'>;
}

export type MediaFile = {
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
    publicId?: string;
}

export type UpdateDataProps<T> = {
    values: string;
    collectionName: string; 
    newData: Partial<Omit<T, 'id' | 'created_at'>>;
}

export type DeleteDataProps = {
    collectionName: string;
    values?: string;
    filters?: [string, WhereFilterOp, any][];
}

export type QueryOption = {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
}

export type PostItemProps = {
    id: string;
    created_at: Date;
    file_url?: string[];
    description: string;
    media_type?: 'image' | 'video' | 'text';
    user_id: string;
}

export type ILikes = {
    id: string;
    created_at: Date;
    post_id: string;
    user_id: string;
    username: string;
}

export type IComments = {
    id: string;
    created_at: Date;
    opinion: string;
    post_id: string;
    user_id: string;
    username: string;
}

export type IGetSelectedData = {
    collection_name: string;
    field_name: string;
    values: string;
}

export type NewPost = {
    id: string;
    created_at: Date;
    file_url?: string[];
    description: string;
    media_type?: 'image' | 'video' | 'text';
    user_id: string;
    uploader_name: string;
}

export type PostListProps = {
    data: PostItemProps[];
}

export type PaginationParams = {
    page_size: number;
    last_visible?: any;
}

export type PaginatedResponse<T> = {
    data: T[];
    last_visible: any;
    has_more: boolean;
}