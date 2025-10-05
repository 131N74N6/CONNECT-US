import mongoose, { Schema, Types } from "mongoose";

// post_owner_id => id user pemilik postingan
// user_id => id user yang sedang sign in

interface ILikes {
    created_at: string;
    post_id: Types.ObjectId;
    post_owner_id: Types.ObjectId;
    user_id: Types.ObjectId;
    username: string;
}

const likeSchema = new Schema<ILikes>({
    created_at: { type: String, required: true },
    post_id: { type: Schema.Types.ObjectId, required: true },
    post_owner_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
});

const Like = mongoose.model<ILikes>('likes', likeSchema, 'likes');

export { ILikes, Like }