export type CurrentUserTokenIntrf = {
    status: string;
    token: string;
    user_id: string;
}

export type CurrentUserIntrf = {
    created_at: string;
    email: string;
    user_id: string;
    username: string;
}

export type SignUpProps = {
    created_at: string;
    email: string;
    password: string;
    username: string;
}

export type SignInProps = {
    email: string;
    password: string;
}

export type UserConnectionStatsProps = {
    followed_total: number;
    follower_total: number;
}