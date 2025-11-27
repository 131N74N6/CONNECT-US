import { Router } from "express";
import { getAllComments, getCommentsTotal, insertComment } from "../controllers/comment.controller";
import { verifyToken } from "../middleware/auth.middleware";

const commentRoutes = Router();

commentRoutes.get('/get-all/:id', verifyToken, getAllComments);

commentRoutes.get('/comment-total/:id', verifyToken, getCommentsTotal)

commentRoutes.post('/add', verifyToken, insertComment);

export default commentRoutes;