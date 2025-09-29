import mongoose, { Schema, Types } from "mongoose";

interface IFollower {
    created_at: string;
    user_id: Types.ObjectId;
    username: string;
    other_user_id: Types.ObjectId;
}

const followerSchema = new Schema<IFollower>({
    created_at: { type: String, required: true },
    other_user_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
});

const Follower = mongoose.model<IFollower>('followers', followerSchema, 'followers');

export { Follower, IFollower }