import { Router } from "express";
import { getAllComments, getCommentsTotal, insertComment } from "../controllers/comment.controller";

const commentRoutes = Router();

commentRoutes.get('/get-all/:id', getAllComments);

commentRoutes.get('/comment-total/:id', getCommentsTotal)

commentRoutes.post('/add', insertComment);

export default commentRoutes;