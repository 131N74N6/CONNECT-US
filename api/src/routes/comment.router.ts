import { Router } from "express";
import { deleteAllComments, getAllComments, insertComment } from "../controllers/comment.controller";

const commentRoutes = Router();

commentRoutes.get('/get-all/:id', getAllComments);

commentRoutes.post('/add', insertComment);

commentRoutes.delete('/erase-all/:id', deleteAllComments);

export default commentRoutes;