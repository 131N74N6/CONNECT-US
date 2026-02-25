import { Request, Response } from "express";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function signIn(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        
        if (!email) {
            res.status(400).json({ message: 'email is required' });
            return;
        }

        if (!email || !password) {
            res.status(400).json({ message: 'email and password is required' });
            return;
        }

        if (!password) {
            res.status(400).json({ message: 'password is required' });
            return;
        }

        const findUser = await User.findOne({ email });

        if (!findUser) {
            res.status(401).json({ message: 'Invalid email. Try again later' });
            return;
        }

        const isPasswordMatch = await bcrypt.compare(password, findUser.password);

        if (!isPasswordMatch) {
            res.status(400).json({ message: 'Invalid password. Try again later' });
            return;
        }

        const token = jwt.sign(
            {
                id: findUser._id, 
                email: findUser.email, 
                username: findUser.username 
            },
            process.env.JWT_SECRET_KEY || 'jwt token',
        );

        res.status(200).json({
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

        if (!email || !password || !username) {
            res.status(400).json({ message: 'email, password, and username is required' });
            return;
        }
        
        if (!email) {
            res.status(400).send({ message: 'email is required' });
            return;
        }

        if (!password) {
            res.status(400).send({ message: 'password is required' });
            return;
        }

        if (!username) {
            res.status(400).send({ message: 'username is required' });
            return;
        }

        const findEmail = await User.findOne({ email });
        const findUsername = await User.findOne({ username });
        
        if (findEmail) {
            res.status(400).send({ message: 'email already exist' });
            return;
        }
        
        if (findUsername) {
            res.status(400).send({ message: 'username already exist' });
            return;
        }

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
        const signedInUser = await User.find({ _id: getUserId });
        res.json(signedInUser);
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