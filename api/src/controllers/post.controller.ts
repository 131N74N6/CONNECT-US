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

async function getAllPosts(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const allPost = await Post.find(
            {}, 
            { _id: 1, description: 1, posts_file: 1, user_id: 1 }
        ).limit(limit).skip(skip);
        
        res.json(allPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSearchedPost(req: Request, res: Response): Promise<void> {
    try {
        const { searched } = req.query;
        
        if (!searched || typeof searched !== 'string') {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }

        const searchedPost = await Post.find({ $text: { $search: searched.trim() } });
        res.json(searchedPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSignedUserPosts(req: Request, res: Response): Promise<void> {
    try {
        const getUserId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const signedInUserPosts = await Post.find(
            { user_id: getUserId }, 
            { _id: 1, description: 1, posts_file: 1, user_id: 1, uploader_name: 1 }
        ).limit(limit).skip(skip);

        const totalPost = await Post.find({ user_id: getUserId }).countDocuments();

        res.json({
            total_post: totalPost,
            posts: signedInUserPosts
        });
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
        const signedUserId = req.params.id;
        const signedUserPost = await Post.find({ user_id: signedUserId });
        const gatherPublicIds: string[] = [];

        signedUserPost.forEach(post => {
            post.posts_file.forEach(file => {
                gatherPublicIds.push(file.public_id);
            });
        });

        const deletePromises = gatherPublicIds.map(public_id => {
            return v2.uploader.destroy(public_id);
        });

        await Promise.all(deletePromises);

        await Promise.all([
            Post.deleteMany({ user_id: signedUserId }),
            Like.deleteMany({ post_owner_id: signedUserId }),
            Comment.deleteMany({ post_owner_id: signedUserId })
        ]);
        
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

        if (selectedPost.posts_file && selectedPost.posts_file.length > 0) {
            const deletePromises = selectedPost.posts_file.map(file => {
                return v2.uploader.destroy(file.public_id);
            });
            await Promise.all(deletePromises);
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

export { 
    deleteAllPosts, 
    deleteSelectedPost, 
    getAllPosts, 
    getSearchedPost, 
    getSelectedPost, 
    getSignedUserPosts, 
    insertNewPost 
}