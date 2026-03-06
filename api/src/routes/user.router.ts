import { Router } from "express";
import { getSelectedUser, signIn, signUp, updateSelectedUser } from "../controllers/user.controller";
import { checkOwnership, verifyToken } from "../middleware/auth.middleware";

const userRoutes = Router();

userRoutes.get('/get/:user_id', verifyToken, checkOwnership, getSelectedUser);
userRoutes.post('/sign-up', signUp);
userRoutes.post('/sign-in', signIn);
userRoutes.put('/change/:user_id', verifyToken, checkOwnership, updateSelectedUser);

export default userRoutes;