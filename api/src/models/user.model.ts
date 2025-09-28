import mongoose, { Schema } from "mongoose";

interface IUser {
    created_at: string;
    email: string;
    password: string;
    username: string;
}

const userSchema = new Schema<IUser>({
    created_at: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true }
});

const User = mongoose.model<IUser>('users', userSchema, 'users');

export { IUser, User }