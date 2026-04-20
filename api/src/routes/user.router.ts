import { Router } from "express";
import { deleteCurrentUser, getCurrentUserData, signIn, signUp, updateSelectedUser } from "../controllers/user.controller";
import { checkOwnership, verifyToken } from "../middleware/auth.middleware";

const userRoutes = Router();

userRoutes.delete('/delete_user/:user_id', verifyToken, checkOwnership, deleteCurrentUser)
userRoutes.get('/profile/:user_id', verifyToken, checkOwnership, getCurrentUserData);
userRoutes.put('/change/:user_id', verifyToken, checkOwnership, updateSelectedUser);
userRoutes.post('/sign-in', signIn);
userRoutes.post('/sign-up', signUp);

export default userRoutes;