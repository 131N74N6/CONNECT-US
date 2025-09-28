import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const db = mongoose.connect(`${process.env.MONGODB_URL}`)
.then(res => {
    if (res) console.log('Database connected');
}).catch(error => {
    console.log(error)
});