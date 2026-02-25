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
app.use('/api/comments', commentRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

db.then(() => {
    app.listen(1234, () => console.log(`server running at http://localhost:1234`));
});