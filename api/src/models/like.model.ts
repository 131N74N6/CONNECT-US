import mongoose, { Schema, Types } from "mongoose";

interface ILikes {
    created_at: string;
    post_id: Types.ObjectId;
    user_id: Types.ObjectId;
}

const likeSchema = new Schema<ILikes>({
    created_at: { type: String, required: true },
    post_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true }
});

const Like = mongoose.model<ILikes>('likes', likeSchema, 'likes');

export { ILikes, Like }