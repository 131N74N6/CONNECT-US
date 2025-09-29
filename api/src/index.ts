import express from 'express';
import { db } from './database/mongodb';
import cors from 'cors';
import postRoutes from './routes/post.router';
import likeRoutes from './routes/like.router';
import commentRoutes from './routes/comment.router';
import userRoutes from './routes/user.router';
import followerRoutes from './routes/follower.router';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/comments', commentRoutes);
app.use('/followers', followerRoutes);
app.use('/likes', likeRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);

db.then(() => {
    app.listen(1234, () => console.log(`server running at http://localhost:1234`));
});