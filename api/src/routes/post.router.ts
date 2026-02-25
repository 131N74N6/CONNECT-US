import { Router } from "express";
import { deleteAllPosts, deleteChosenFiles, deleteOnePost, getAllPosts, getSearchedPost, getSelectedPost, getSignedUserPosts, getUserTotalPost, insertNewPost, updatePost } from "../controllers/post.controller";
import { checkOwnership, verifyToken } from "../middleware/auth.middleware";

const postRoutes = Router();

postRoutes.delete('/erase-chosen', verifyToken, deleteChosenFiles);
postRoutes.delete('/erase-all/:user_id', verifyToken, checkOwnership, deleteAllPosts);
postRoutes.delete('/erase/:id', verifyToken, deleteOnePost);
postRoutes.get('/get-all', verifyToken, getAllPosts);
postRoutes.get('/signed-user/:user_id', verifyToken, getSignedUserPosts);
postRoutes.get('/selected/:id', verifyToken, getSelectedPost);
postRoutes.get('/post-total/:user_id', verifyToken, getUserTotalPost);
postRoutes.get('/searched', verifyToken, getSearchedPost);
postRoutes.post('/add', verifyToken, insertNewPost);
postRoutes.put('/edit/:id', verifyToken, updatePost);

export default postRoutes;