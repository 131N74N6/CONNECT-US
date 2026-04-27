import { Request, Response } from "express";
import { Post } from "../models/post.model";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model";
import { v2 } from "cloudinary";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function signIn(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const findEmail = await User.findOne({ email });
        
        if (!password || !email) return res.status(400).json({ message: "email and password is required" });
        if (!email) return res.status(400).json({ message: 'email is required' });
        if (!password) return res.status(400).json({ message: 'password is required' });

        if (!findEmail) return res.status(404).json({ message: 'email not found' });
        
        const isPasswordMatch = await bcrypt.compare(password, findEmail.password);
        if (!isPasswordMatch) return res.status(400).json({ message: 'incorrect password' });

        const generatedToken = jwt.sign(
            { user_id: findEmail._id.toString() },
            process.env.JWT_TOKEN || 'your_secret_key',
        );

        res.status(200).json({
            status: 'ok',
            token: generatedToken,
            user_id: findEmail._id.toString()
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function signUp(req: Request, res: Response) {
    try {
        const { created_at, email, password, username } = req.body;
        
        if (!password || !email || !username) return res.status(400).json({ message: "email, username, and password is required" });
        if (!email) return res.status(400).send({ message: 'email is required' });
        if (!password) return res.status(400).send({ message: 'password is required' });
        if (!username) return res.status(400).send({ message: 'username is required' });
        
        const findEmail = await User.findOne({ email: email });
        if (findEmail) return res.status(400).send({ message: 'this email already exist' });

        const findUser = await User.findOne({ username: username });
        if (findUser) return res.status(400).send({ message: 'this username already exist' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ created_at, email, password: hashedPassword, username });
        await newUser.save();
        res.status(201).json({ message: 'user added' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

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
            deleteFromCloudinary,
            Post.deleteMany({ user_id: req.params.user_id }),
            Like.deleteMany({ post_owner_id: req.params.user_id }),
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
        await User.updateOne({ _id: req.params.user_id }, {
            $set: {
                username: req.body.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
}