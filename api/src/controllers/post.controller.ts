import { Request, Response } from "express";
import { Post } from "../models/post.model";

async function getAllPosts(_: Request, res: Response): Promise<void> {
    try {
        const allPost = await Post.find({}, { _id: 1, description: 1, file_url: 1 });
        res.json(allPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSearchedPost(req: Request, res: Response): Promise<void> {
    try {
        const { searched } = req.body;
        const getSearchedPost = await Post.find({ $text: { $search: searched } });
        res.json(getSearchedPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSignedUserPosts(req: Request, res: Response): Promise<void> {
    try {
        const getUserId = req.params.id;
        const signedUserPosts = await Post.find({ user_id: getUserId }, { _id: 1, description: 1, file_url: 1 });
        res.json(signedUserPosts);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSelectedPost(req: Request, res: Response): Promise<void> {
    try {
        const getPostId = req.params.id;
        const getSelectedPost = await Post.find({ _id: getPostId });
        res.json(getSelectedPost)
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function insertNewPost(req: Request, res: Response): Promise<void> {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json({ message: 'new post added' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function deleteAllPosts(req: Request, res: Response): Promise<void> {
    try {
        const getUserId = req.params.id;
        await Post.deleteMany({ user_id: getUserId });
        res.status(201).json({ message: 'all post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function deleteSelectedPost(req: Request, res: Response): Promise<void> {
    try {
        const getPostId = req.params.id;
        await Post.deleteOne({ _id: getPostId });
        res.status(201).json({ message: 'post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { 
    deleteAllPosts, deleteSelectedPost, getAllPosts, getSearchedPost, 
    getSelectedPost, getSignedUserPosts, insertNewPost 
}