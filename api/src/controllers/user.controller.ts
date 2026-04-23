import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Post } from "../models/post.model";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model";
import { v2 } from "cloudinary";

export async function signIn(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        
        if (!email) {
            res.status(400).json({ message: "email is required" });
            return;
        }

        if (!email || !password) {
            res.status(400).json({ message: "email and password is required" });
            return;
        }

        if (!password) {
            res.status(400).json({ message: "password is required" });
            return;
        }

        const findUser = await User.findOne({ email });

        if (!findUser) {
            res.status(401).json({ message: "Invalid email. Try again later" });
            return;
        }

        const isPasswordMatch = await bcrypt.compare(password, findUser.password);

        if (!isPasswordMatch) {
            res.status(400).json({ message: "Invalid password. Try again later" });
            return;
        }

        const token = jwt.sign(
            { user_id: findUser._id.toString() },
            process.env.JWT_SECRET_KEY || "your_secret_key",
        );

        res.status(200).json({
            status: "sign-in successfully",
            token,
            user_id: findUser._id
        });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
}

export async function signUp(req: Request, res: Response) {
    try {
        const { created_at, email, password, username } = req.body;

        if (!email || !password || !username) {
            res.status(400).json({ message: "email, password, and username is required" });
            return;
        }
        
        if (!email) {
            res.status(400).send({ message: "email is required" });
            return;
        }

        if (!password) {
            res.status(400).send({ message: "password is required" });
            return;
        }

        if (!username) {
            res.status(400).send({ message: "username is required" });
            return;
        }

        const findEmail = await User.findOne({ email });
        const findUsername = await User.findOne({ username });
        
        if (findEmail) {
            res.status(400).send({ message: "email already exist" });
            return;
        }
        
        if (findUsername) {
            res.status(400).send({ message: "username already exist" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            created_at,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();
        res.status(200).json({ message: "new user added" });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
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