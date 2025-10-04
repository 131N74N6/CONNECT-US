import { Request, Response } from "express";
import { Comment } from "../models/comment.model";

async function getAllComments(req: Request, res: Response) {
    try {
        const getPostId = req.params.id;
        const getComments = await Comment.find({ post_id: getPostId });
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