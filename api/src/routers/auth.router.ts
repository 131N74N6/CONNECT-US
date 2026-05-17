import { Router } from "express";
import { signIn, signUp } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post('/sign-in', signIn);
authRoutes.post('/sign-up', signUp);

export default authRoutes;