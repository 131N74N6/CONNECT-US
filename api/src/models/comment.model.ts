import mongoose, { Schema, Types } from "mongoose";

interface IComment {
    created_at: string;
    opinions: string;
    post_id: Types.ObjectId;
    user_id: Types.ObjectId;
    username: string;
}

const commentSchema = new Schema<IComment>({
    created_at: { type: String, required: true },
    opinions: { type: String, required: true },
    post_id: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
});

const Comment = mongoose.model<IComment>('comments', commentSchema, 'comments');

export { Comment, IComment }