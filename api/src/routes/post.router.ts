import { Router } from "express";
import { 
    deleteAllPosts, deleteSelectedPost, getAllPosts, getSearchedPost, getSelectedPost, getSignedUserPosts, insertNewPost 
} from "../controllers/post.controller";

const postRoutes = Router();

postRoutes.get('/get-all', getAllPosts);

postRoutes.get('/signed-user/:id', getSignedUserPosts);

postRoutes.get('/selected/:id', getSelectedPost);

postRoutes.post('/add', insertNewPost);

postRoutes.post('/searched', getSearchedPost);

postRoutes.delete('/erase-all/:id', deleteAllPosts);

postRoutes.delete('/erase/:id', deleteSelectedPost);

export default postRoutes;