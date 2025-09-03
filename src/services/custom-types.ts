export type DatabaseProps = {
    tableName: string;
    additionalQuery?: (query: any) => any;
    relationalQuery?: string;
    uniqueQueryKey?: any[];
}

export type InsertDataProps<T> = {
    tableName: string;
    newData: Omit<T, 'id' | 'created_at'>;
}

export type UpdateDataProps<T> = {
    tableName: string;
    chosenData: Partial<Omit<T, 'id' | 'created_at'>>;
    column: string;
    values: string;
}

export type UpsertDataProps<T> = {
    tableName: string;
    data: Partial<T>;
}

export type DeleteDataProps = {
    tableName: string;
    column?: string;
    values?: string;
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
    image_url: string[];
}

export type PostListProps = {
    data: PostItemProps[];
}

export type PostDetailProps = {
    id: string;
    created_at: Date;
    description: string;
    image_url: string[];
    user_id: string;
}