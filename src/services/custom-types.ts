import type { QueryOptions } from "@tanstack/react-query";
import type { WhereFilterOp, OrderByDirection } from "firebase/firestore";

export type DatabaseProps<T> = {
    collectionName: string;
    callback?: (data: T[]) => void;
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
    file_url: string[];
}

export type PostListProps = {
    data: PostItemProps[];
}

export type PostDetailProps = {
    id: string;
    created_at: Date;
    description: string;
    file_url: string[];
    user_id: string;
}