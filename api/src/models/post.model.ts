import mongoose, { Schema, Types } from "mongoose";

interface IPost {
    created_at: string;
    description: string;
    posts_file: { 
        file_url: string;
        public_id: string;
    }[];
    uploader_name: string;
    user_id: Types.ObjectId;
}

const postSchema = new Schema<IPost>({
    created_at: { type: String, required: true },
    description: { type: String, required: true },
    posts_file: [{
        file_url: { type: String },
        public_id: { type: String }
    }],
    uploader_name: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
});

const Post = mongoose.model<IPost>('post-list', postSchema, 'post-list');

export { IPost, Post }