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
    post_owner_id: string;
    user_id: string;
    username: string;
}

export type LikesData = {
    data: ILikes[];
    like_total: number;
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
    size: number;
    setSize: (size: number | ((_size: number) => number)) => Promise<any[] | undefined>;
}

export type CommentProps = {
    comments_data: IComments[];
    comment: string;
    sendComment: (event: React.FormEvent) => Promise<void>;
    setComment: (value: React.SetStateAction<string>) => void
    onClose: () => void;
}

export type IFollowers = {
    _id: string;
    created_at: string;
    followed_user_id: string;
    followed_username: string;
    user_id: string;
    username: string;
}

export type FollowersData = {
    followers: Pick<IFollowers, 'created_at' | 'user_id' | 'username'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    size: number;
    setSize: (size: number | ((_size: number) => number)) => Promise<any[] | undefined>;
    onClose: (value: React.SetStateAction<boolean>) => void
}

export type FollowingData = {
    following: Pick<IFollowers, 'created_at' | 'followed_user_id' | 'followed_username'>[];
    isReachedEnd: boolean;
    loadMore: boolean;
    size: number;
    setSize: (size: number | ((_size: number) => number)) => Promise<any[] | undefined>;
    onClose: (value: React.SetStateAction<boolean>) => void
}