import { Request, Response } from "express";
import { Post } from "../models/post.model";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model";
import { v2 } from "cloudinary";
import { User } from "../models/user.model";
import { Follower } from "../models/follower.model";

export async function deleteCurrentUser(req: Request, res: Response) {
    try {
        const currentUserPublicIds: string[] = [];
        const currentUserPosts = await Post.find({ user_id: req.params.user_id });

        if (!currentUserPosts) return res.status(404).json({ message: 'Post not found.' });

        currentUserPosts.forEach(currentPost => {
            currentPost.posts_file.forEach(post_file => {
                currentUserPublicIds.push(post_file.public_id);
            });
        });

        const deleteFromCloudinary = currentUserPublicIds.map(currentPublicId => {
            return v2.uploader.destroy(currentPublicId);
        })

        await Promise.all([
            ...deleteFromCloudinary,
            Post.deleteMany({ user_id: req.params.user_id }),
            Like.deleteMany({ post_owner_id: req.params.user_id }),
            Follower.deleteMany({ user_id: req.params.user_id }),
            Follower.deleteMany({ followed_user_id: req.params.user_id }),
            Comment.deleteMany({ post_owner_id: req.params.user_id }),
            User.deleteOne({ _id: req.params.user_id }),
        ]);

        res.status(200).json({ message: "user deleted" });
    } catch (error) {
        res.status(500).json({ message: "internal server error" })
    }
}

export async function getCurrentUserData(req: Request, res: Response) {
    try {
        const findUser = await User.find({ _id: req.params.user_id });

        if (!findUser) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            created_at: findUser[0].created_at,
            email: findUser[0].email,
            user_id: findUser[0]._id,
            username: findUser[0].username
        });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
}

export async function updateSelectedUser(req: Request, res: Response) {
    try {
        if (!req.body.username) return res.status(400).json({ message: "username is required" });
        
        await Promise.all([
            User.updateOne({ _id: req.params.user_id }, {
                $set: { username: req.body.username }
            }),
            Comment.updateMany({ user_id: req.params.user_id }, {
                $set: { username: req.body.username }
            }),
            Follower.updateOne({ followed_user_id: req.params.user_id }, {
                $set: { followed_username: req.body.username }
            }),
            Follower.updateMany({ user_id: req.params.user_id }, {
                $set: { username: req.body.username }
            }),
            Post.updateMany({ user_id: req.params.user_id }, {
                $set: { uploader_name: req.body.username }
            }),
            Like.updateMany({ user_id: req.params.user_id }, {
                $set: { username: req.body.username }
            }),
        ]);
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
}