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
    data: Omit<T, 'id' | 'created_at'>;
}

export type UpdateDataProps<T> = {
    docId: string;
    collectionName: string; 
    newData: Partial<Omit<T, 'id' | 'created_at'>>;
}

export type DeleteDataProps = {
    collectionName: string;
    docId?: string;
    filters?: [string, WhereFilterOp, any][];
}

export type QueryOption = {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
}

export type Users = {
    id: string;
    email: string;
    password: string;
    username: string;
}

export type UsersProfiles = {
    id: string;
    email: string;
    gender: 'male' | 'female';
    birth_date: string;
    username: string;
}

export type NotificationProps = {
    className: string;
    onClose: () => void;
    message: string;
}

export type PostItemProps = {
    id: string;
    created_at: Date;
    file_url?: string[];
    description: string;
    media_type?: 'image' | 'video' | 'text';
    user_id: string;
}

export type PostListProps = {
    data: PostItemProps[];
}