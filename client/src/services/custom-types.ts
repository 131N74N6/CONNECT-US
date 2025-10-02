export type IPostData<T> = {
    api_url: string;
    data: Omit<T, '_id'>;
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
    user_id: string;
}

export type IComments = {
    _id: string;
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
    _id: string;
    created_at: string;
    file_url?: string[];
    description: string;
    user_id: string;
    uploader_name: string;
}

export type PostItemProps = {
    _id: string;
    description: string;
    file_url?: string[];
    user_id: string;
}

export type PostDetail = {
    _id: string;
    created_at: string;
    description: string;
    uploader_name: string;
    file_url?: string[];
    user_id: string;
}

export type PostListProps = {
    data: PostItemProps[];
}

export type CommentProps = {
    comments_data: IComments[];
    onClose: () => void;
}

export type IFollowers = {
    _id: string;
    created_at: string;
    other_user_id: string;
    user_id: string;
    username: string;
}

export type NotificationProps = {
    className: string;
    message: string;
    onClose: () => void;
}