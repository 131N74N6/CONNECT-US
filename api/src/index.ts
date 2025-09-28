import express, { Request, Response } from 'express';
import { db } from './database/mongodb';
import cors from 'cors';
import postRoutes from './routes/post.router';
import likeRoutes from './routes/like.router';
import commentRoutes from './routes/comment.router';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/posts', postRoutes);
app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);

db.then(() => {
    app.listen(1234, () => console.log(`server running at http://localhost:1234`));
});