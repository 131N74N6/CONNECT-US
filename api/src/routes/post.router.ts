import { Router } from "express";
import { 
    deleteAllPosts, deleteSelectedFile, getAllPosts, getSelectedPost, getSignedUserPosts, insertNewPost 
} from "../controllers/post.controller";

const postRoutes = Router();

postRoutes.get('/get-all/', getAllPosts);

postRoutes.get('/signed-user/:id', getSignedUserPosts);

postRoutes.get('/selected/:id', getSelectedPost);

postRoutes.post('/add', insertNewPost);

postRoutes.delete('/erase-all/:id', deleteAllPosts);

postRoutes.delete('/erase/:id', getSelectedPost);

postRoutes.delete('/remove-selected-file', deleteSelectedFile);

export default postRoutes;