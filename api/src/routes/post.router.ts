import { Router } from "express";
import { deleteAllPosts, getAllPosts, getSelectedPost, insertNewPost } from "../controllers/post.controller";

const postRoutes = Router();

postRoutes.get('/get-all/:id', getAllPosts);

postRoutes.get('/selected/:id', getSelectedPost);

postRoutes.post('/add', insertNewPost);

postRoutes.delete('/erase-all/:id', deleteAllPosts);

postRoutes.delete('/erase/:id', getSelectedPost);

export default postRoutes;