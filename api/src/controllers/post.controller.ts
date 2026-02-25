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

export async function deleteAllPosts(req: Request, res: Response) {
    try {
        const signedUserId = req.params.user_id;
        const signedUserPost = await Post.find({ user_id: signedUserId });
        const gatherPublicIds: string[] = [];
        
        if (!signedUserPost) return res.status(404).json({ message: 'Post not found.' });

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

export async function deleteChosenFiles(req: Request, res: Response) {
    try {
        const { publicIds } = req.body as { publicIds: string[] };

        const deletePromises = publicIds.map(public_id => {
            return v2.uploader.destroy(public_id);
        });

        await Promise.all(deletePromises);

        res.status(200).json({ message: 'files deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function deleteOnePost(req: Request, res: Response) {
    try {
        const getPostId = req.params.id;
        const selectedPost = await Post.find({ _id: getPostId });

        if (selectedPost[0].posts_file && selectedPost[0].posts_file.length > 0) {
            const deletePromises = selectedPost[0].posts_file.map(file => {
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

export async function getAllPosts(req: Request, res: Response) {
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

export async function getSearchedPost(req: Request, res: Response) {
    try {
        const { searched } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        
        if (!searched || typeof searched !== 'string') return res.status(400).json({ message: 'Search query is required' });

        if (isNaN(page) || page < 1) return res.status(400).json({ message: 'Invalid page parameter' });

        if (isNaN(limit) || limit < 1 || limit > 12) return res.status(400).json({ message: 'Invalid limit parameter' });

        const searchedPost = await Post.find(
            { description: { $regex: new RegExp(searched, 'i') } },
            { _id: 1, description: 1, posts_file: 1, user_id: 1 }
        ).limit(limit).skip(skip);
        
        res.json(searchedPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function getSignedUserPosts(req: Request, res: Response) {
    try {
        const getUserId = req.params.user_id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const signedInUserPosts = await Post.find(
            { user_id: getUserId }, 
            { _id: 1, description: 1, posts_file: 1, user_id: 1, uploader_name: 1 }
        ).limit(limit).skip(skip);

        res.json(signedInUserPosts);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function getSelectedPost(req: Request, res: Response) {
    try {
        const getPostId = req.params.id;
        const getSelectedPost = await Post.find({ _id: getPostId });

        if (!getSelectedPost) return res.status(404).json({ message: 'Post not found.' });

        res.json(getSelectedPost)
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function getUserTotalPost(req: Request, res: Response) {
    try {
        const getUserId = req.params.user_id;
        const totalPost = await Post.find({ user_id: getUserId }).countDocuments();
        res.json(totalPost);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function insertNewPost(req: Request, res: Response) {
    try {
        if (!req.body.description) {
            return res.status(400).json({ message: 'Failed to create new post' });
        }

        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json({ message: 'new post added' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export async function updatePost(req: Request, res: Response) {
    try {
        if (!req.body.description) {
            return res.status(400).json({ message: 'Failed to create new post' });
        }

        await Post.updateOne({ _id: req.params.id }, {
            $set: {
                description: req.body.description,
                posts_file: req.body.posts_file
            }
        });
        res.status(200).json({ message: 'post updated' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}