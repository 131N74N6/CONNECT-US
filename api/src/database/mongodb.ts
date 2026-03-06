import mongoose from 'mongoose';

export const db = mongoose.connect(`${process.env.MONGODB_URL}`)
.then(res => {
    if (res) console.log('Database connected');
}).catch(error => {
    console.log(error)
});