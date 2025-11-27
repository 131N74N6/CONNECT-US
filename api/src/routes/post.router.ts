import { Router } from "express";
import { 
    deleteAllPosts, deleteSelectedPost, getAllPosts, getSearchedPost, 
    getSelectedPost, getSignedUserPosts, getUserTotalPost, insertNewPost 
} from "../controllers/post.controller";
import { checkOwnership, verifyToken } from "../middleware/auth.middleware";

const postRoutes = Router();

postRoutes.delete('/erase-all/:id', verifyToken, checkOwnership, deleteAllPosts);

postRoutes.delete('/erase/:id', verifyToken, deleteSelectedPost);

postRoutes.get('/get-all', verifyToken, getAllPosts);

postRoutes.get('/signed-user/:id', verifyToken, checkOwnership, getSignedUserPosts);

postRoutes.get('/selected/:id', verifyToken, getSelectedPost);

postRoutes.get('/post-total/:id', verifyToken, checkOwnership, getUserTotalPost);

postRoutes.post('/add', verifyToken, insertNewPost);

postRoutes.get('/searched', verifyToken, getSearchedPost);

export default postRoutes;