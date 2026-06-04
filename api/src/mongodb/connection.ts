import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connection = mongoose.connect((`${process.env.MONGODB_URL}`))
.then(res => {
    if (res) console.log('Database connection succeffully');
}).catch(err => {
    console.log("Database connection check failed:", err);
});