import mongoose, { Schema, Types } from "mongoose";

// followed_user_id => yang diikuti
// user_id => pengikut

interface IFollower {
    created_at: string;
    followed_user_id: Types.ObjectId;
    followed_username: string;
    user_id: Types.ObjectId;
    username: string;
}

const followerSchema = new Schema<IFollower>({
    created_at: { type: String, required: true },
    followed_user_id: { type: Schema.Types.ObjectId, required: true },
    followed_username: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
});

const Follower = mongoose.model<IFollower>('followers', followerSchema, 'followers');

export { Follower, IFollower }