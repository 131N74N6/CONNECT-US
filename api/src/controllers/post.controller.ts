import { Request, Response } from 'express';
import { Post } from '../models/post.model';
import dotenv from 'dotenv';
import { v2 } from 'cloudinary';
import { Like } from '../models/like.model';
import { Comment } from '../models/comment.model';

dotenv.config();

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getAllPosts(_: Request, res: Response): Promise<void> {
    try {
        const allPost = await Post.find({}, { _id: 1, description: 1, file_url: 1, user_id: 1 });
        res.json(allPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSearchedPost(req: Request, res: Response): Promise<void> {
    try {
        const { searched } = req.body;
        const searchedPost = await Post.find({ $text: { $search: searched } });
        res.json(searchedPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSignedUserPosts(req: Request, res: Response): Promise<void> {
    try {
        const getUserId = req.params.id;
        const signedUserPosts = await Post.find({ user_id: getUserId }, { _id: 1, description: 1, file_url: 1, user_id: 1 });
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
        const selectedPost = await Post.findById(getPostId);

        if (!selectedPost) {
            res.status(404).json({ message: 'Post not found.' });
            return;
        }

        if (selectedPost.file_url && selectedPost.file_url.length > 0) {
            const deletePromises = selectedPost.file_url.map(url => {
                const urlParts = url.split('/');
                const publicIdWithExt = urlParts.slice(7).join('/').replace(/\.[^/.]+$/, "");
                const publicId = publicIdWithExt.startsWith('sns_posts/') ? publicIdWithExt : `sns_posts/${publicIdWithExt}`;
                return v2.uploader.destroy(publicId);
            });
            await Promise.allSettled(deletePromises);
        }
        
        await Promise.all([
            Post.deleteOne({ _id: getPostId }),
            Comment.deleteMany({ post_id: getPostId }),
            Like.deleteMany({ post_id: getPostId })
        ]);

        res.status(200).json({ message: 'post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function deleteSelectedFile(req: Request, res: Response) {
    try {
        const { folder_name, public_id } = req.body;
        await v2.uploader.destroy(`${folder_name}/${public_id}`);
        res.status(201).json({ message: 'file successfully removed from cloudinary' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { 
    deleteAllPosts, deleteSelectedFile, deleteSelectedPost, getAllPosts, getSearchedPost, 
    getSelectedPost, getSignedUserPosts, insertNewPost 
}