import { Router } from "express";
import { getAllComments, insertComment } from "../controllers/comment.controller";

const commentRoutes = Router();

commentRoutes.get('/get-all/:id', getAllComments);

commentRoutes.post('/add', insertComment);

export default commentRoutes;