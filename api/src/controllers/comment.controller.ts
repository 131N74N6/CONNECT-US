import { Request, Response } from "express";
import { Comment } from "../models/comment.model";

async function getAllComments(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const getPostId = req.params.id;
        const getComments = await Comment.find(
            { post_id: getPostId },
            { created_at: 1, username: 1, opinions: 1 }
        ).limit(limit).skip(skip);
        res.json(getComments);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function insertComment(req: Request, res: Response) {
    try {
        const newComment = new Comment(req.body);
        await newComment.save();
        res.status(201).send({ message: 'new comment added' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { getAllComments, insertComment }