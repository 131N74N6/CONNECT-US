export type IPostData<T> = {
    api_url: string;
    data: Omit<T, 'id'>;
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

export type ILikes = {
    id: string;
    created_at: string;
    post_id: string;
    user_id: string;
}

export type IComments = {
    id: string;
    created_at: string;
    opinions: string;
    post_id: string;
    user_id: string;
    username: string;
}

export type IGetSelectedData = {
    collection_name: string;
    values: string;
}

export type NewPost = {
    id: string;
    created_at: string;
    file_url?: string[];
    description: string;
    user_id: string;
    uploader_name: string;
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

export type CommentProps = {
    comments_data: IComments[];
    onClose: () => void;
}

export type NotificationProps = {
    className: string;
    message: string;
    onClose: () => void;
}