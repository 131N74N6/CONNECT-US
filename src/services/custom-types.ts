import type { QueryOptions } from "@tanstack/react-query";
import type { WhereFilterOp, OrderByDirection } from "firebase/firestore";

export type DatabaseProps = {
    collectionName: string;
    queryOptions?: QueryOptions;
    filters?: [string, WhereFilterOp, any][];
    orderBy?: [string, OrderByDirection][];
    limit?: number;
}

export type InsertDataProps<T> = {
    collectionName: string; 
    data: Omit<T, 'created_at'>;
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