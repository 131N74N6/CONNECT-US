import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function signIn(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        
        if (!email) return res.status(400).json({ message: 'email is required' });
        if (!password) return res.status(400).json({ message: 'password is required' });

        const findUser = await User.findOne({ email });
        if (!findUser) return res.status(401).json({ message: 'Invalid email. Try again later' });

        const isPasswordMatch = await bcrypt.compare(password, findUser.password);
        if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid password. Try again later' })

        const token = jwt.sign(
            {
                id: findUser._id, 
                email: findUser.email, 
                username: findUser.username 
            },
            process.env.JWT_SECRET_KEY || 'jwt token',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            status: 'sign-in successfully',
            token,
            info: {
                id: findUser._id, 
                email: findUser.email, 
                username: findUser.username 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function signUp(req: Request, res: Response) {
    try {
        const { created_at, email, password, username } = req.body;
        
        if (!email) return res.status(400).send({ message: 'email is required' });
        if (!password) return res.status(400).send({ message: 'password is required' });
        if (!username) return res.status(400).send({ message: 'username is required' });

        const findUser = await User.findOne({ email });
        if (findUser) return res.status(409).send({ message: 'User already exist' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            created_at,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();
        res.status(201).json({ message: 'new user added' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getSelectedUser(req: Request, res: Response) {
    try {
        const getUserId = req.params.id;
        const findUser = await User.find({ _id: getUserId }, { email: 1, username: 1 });
        res.json(findUser);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function updateSelectedUser(req: Request, res: Response) {
    try {
        const getUserId = req.params.id;
        await User.updateOne({ _id: getUserId }, {
            $set: {
                username: req.body.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { getSelectedUser, signIn, signUp, updateSelectedUser }