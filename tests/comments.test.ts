import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../src/server';
import Comment from '../src/models/comment';
import Post from '../src/models/post';
import User from '../src/models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = initApp();
let token: string;
let userId: string;
let postId: string;
let commentId: string;
let testUser: any;
let testPost: any;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api');

    // יצירת משתמש בדיקה
    testUser = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });
    userId = testUser._id.toString();

    // יצירת פוסט בדיקה
    testPost = await Post.create({
        recipeTitle: 'Test Recipe',
        category: ['test'],
        difficulty: 'easy',
        prepTime: 30,
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['instruction1', 'instruction2'],
        authorId: userId,
    });
    postId = testPost._id.toString();

    // יצירת טוקן
    token = jwt.sign({ userId: userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
});

afterAll(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
});

describe('Comments API Tests', () => {
    it('should create a new comment', async () => {
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Test Comment',
                postId: postId,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        commentId = response.body._id;
    });

    it('should get comments by post ID', async () => {
        const response = await request(app).get(`/comment/post/${postId}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update a comment', async () => {
        const response = await request(app)
            .put(`/comment/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(200);
        expect(response.body.content).toBe('Updated Comment');
    });

    it('should delete a comment', async () => {
        const response = await request(app)
            .delete(`/comment/${commentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);

        const getResponse = await request(app).get(`/comment/${commentId}`);
        expect(getResponse.status).toBe(404);
    });

    it('should not create a comment without authentication', async () => {
        const response = await request(app)
            .post('/comment')
            .send({
                content: 'Test Comment',
                postId: postId,
            });

        expect(response.status).toBe(403);
    });

    it('should not update a comment without authentication', async () => {
        const response = await request(app)
            .put(`/comment/${commentId}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(403);
    });

    it('should not delete a comment without authentication', async () => {
        const response = await request(app)
            .delete(`/comment/${commentId}`);

        expect(response.status).toBe(403);
    });

    it('should not create a comment with invalid post ID', async () => {
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Test Comment',
                postId: 'invalid-post-id',
            });

        expect(response.status).toBe(400);
    });

    it('should not create a comment with non-existent post ID', async () => {
        const nonExistentPostId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Test Comment',
                postId: nonExistentPostId.toString(),
            });

        expect(response.status).toBe(404);
    });

    it('should not update a comment with invalid ID', async () => {
        const response = await request(app)
            .put('/comment/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Updated Comment',
            });
    
        expect(response.status).toBe(400); // שינוי ל-400
    });

    it('should not delete a comment with invalid ID', async () => {
        const response = await request(app)
            .delete('/comment/invalid-id')
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(400); // שינוי ל-400
    });


    it('should handle error when creating a comment', async () => {
        // מחיקת הפוסט כדי לגרום לשגיאה ביצירת תגובה
        await Post.findByIdAndDelete(postId);

        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Test Comment',
                postId: postId,
            });

        expect(response.status).toBe(404); // שינוי ל-404
        expect(response.body).toHaveProperty('message', 'Post not found');

        // יצירת הפוסט מחדש כדי לא להשפיע על טסטים אחרים
        await Post.create({
            _id: postId,
            recipeTitle: 'Test Recipe',
            category: ['test'],
            difficulty: 'easy',
            prepTime: 30,
            ingredients: ['ingredient1', 'ingredient2'],
            instructions: ['instruction1', 'instruction2'],
            authorId: userId,
        });
    });

    it('should handle error when updating a comment', async () => {
        // יצירת תגובה חדשה לטסט זה
        const newComment = await Comment.create({
            content: 'Test Comment',
            postId: postId,
            author: userId,
        });

        const response = await request(app)
            .put(`/comment/${newComment._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('content', 'Updated Comment');
    });

    it('should handle error when deleting a comment', async () => {
        // יצירת תגובה חדשה לטסט זה
        const newComment = await Comment.create({
            content: 'Test Comment',
            postId: postId,
            author: userId,
        });

        const response = await request(app)
            .delete(`/comment/${newComment._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Comment deleted');
    });

    it('should handle server error when updating a comment', async () => {
        // שינוי ה-ID של התגובה כדי לגרום לשגיאה כללית
        const invalidCommentId = 'invalid-comment-id';

        const response = await request(app)
            .put(`/comment/${invalidCommentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Updated Comment',
            });
        expect(response.status).toBe(400); // שינוי ל-400
        expect(response.body).toHaveProperty('message', 'Invalid comment ID');
    });

    it('should handle server error when deleting a comment', async () => {
        // שינוי ה-ID של התגובה כדי לגרום לשגיאה כללית
        const invalidCommentId = 'invalid-comment-id';

        const response = await request(app)
            .delete(`/comment/${invalidCommentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400); // שינוי ל-400
        expect(response.body).toHaveProperty('message', 'Invalid comment ID');
    });


    it('should not create a comment without content', async () => {
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                postId: postId,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Content is required');
    });

    it('should not create a comment with empty content', async () => {
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: '   ',
                postId: postId,
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Content is required');
    });

    it('should handle error when getting comments by post - post not found', async () => {
        const nonExistentPostId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/comment/post/${nonExistentPostId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Post not found');
    });

    it('should handle error when getting comments by post - server error', async () => {
        // יצירת postId לא תקין כדי לגרום לשגיאת שרת
        const invalidPostId = 'invalid-post-id';

        const response = await request(app).get(`/comment/post/${invalidPostId}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid postId');
    });

    it('should not update a comment with empty content', async () => {
        const response = await request(app)
            .put(`/comment/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: '   ',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Content is required');
    });

    it('should not update a comment without content', async () => {
        const response = await request(app)
            .put(`/comment/${commentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Content is required');
    });

    it('should not update a comment with invalid comment ID', async () => {
        const invalidCommentId = 'invalid-comment-id';
        const response = await request(app)
            .put(`/comment/${invalidCommentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid comment ID');
    });

    it('should not update a comment with non-existent comment ID', async () => {
        const nonExistentCommentId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/comment/${nonExistentCommentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Comment not found');
    });


    it('should not delete a comment with invalid comment ID', async () => {
        const invalidCommentId = 'invalid-comment-id';
        const response = await request(app)
            .delete(`/comment/${invalidCommentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid comment ID');
    });

    it('should not delete a comment with non-existent comment ID', async () => {
        const nonExistentCommentId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .delete(`/comment/${nonExistentCommentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Comment not found');
    });




});