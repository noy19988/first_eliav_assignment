import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server';
import User from '../src/models/user';
import Post from '../src/models/post';
import Comment from '../src/models/comment';

let accessToken: string;
let testUser: string;
let testPost: mongoose.Types.ObjectId;

beforeAll(async () => {
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api', {
    });
});

afterAll(async () => {
    // ניקוי מסד הנתונים וסגירת החיבור
    const connection = mongoose.connection;
    if (connection.db) {
        await connection.db.dropDatabase();
    }
    await connection.close();
});

beforeEach(async () => {
    // ניקוי אוספים רלוונטיים
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // יצירת משתמש דרך פונקציית register
    await request(app)
        .post('/users/register')
        .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });

    // התחברות דרך פונקציית login וקבלת accessToken
    const loginResponse = await request(app)
        .post('/users/login')
        .send({
            email: 'testuser@example.com',
            password: 'password123',
        });

    accessToken = loginResponse.body.token as string;

    // יצירת משתמש לדוגמה
    const user = await User.findOne({ email: 'testuser@example.com' });
    if (user) {
        testUser = user._id;
    }

    // יצירת פוסט לדוגמה
    const post = new Post({
        title: 'Test Post',
        content: 'Test Content',
        author: testUser,
    });
    const savedPost = await post.save();
    testPost = savedPost._id;
});

describe('Comments API', () => {
    it('should create a new comment', async () => {
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Test Comment',
                postId: testPost,
                author: testUser,
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            content: 'Test Comment',
            postId: testPost.toString(),
            author: testUser.toString(),
        });
    });

    it('should fetch comments by post ID', async () => {
        // יצירת שתי תגובות לדוגמה
        const comment1 = new Comment({
            content: 'Comment 1',
            postId: testPost,
            author: testUser,
        });
        const comment2 = new Comment({
            content: 'Comment 2',
            postId: testPost,
            author: testUser,
        });
        await comment1.save();
        await comment2.save();

        // שליפת תגובות לפי postId
        const response = await request(app).get(`/comment/post/${testPost}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toMatchObject({ content: 'Comment 1' });
        expect(response.body[1]).toMatchObject({ content: 'Comment 2' });
    });

    it('should update a comment', async () => {
        const comment = new Comment({
            content: 'Old Comment',
            postId: testPost,
            author: testUser,
        });
        const savedComment = await comment.save();

        const response = await request(app)
            .put(`/comment/${savedComment._id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Updated Comment' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ content: 'Updated Comment' });
    });

    it('should delete a comment', async () => {
        const comment = new Comment({
            content: 'Comment to delete',
            postId: testPost,
            author: testUser,
        });
        const savedComment = await comment.save();

        const response = await request(app)
            .delete(`/comment/${savedComment._id}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Comment deleted' });

        const deletedComment = await Comment.findById(savedComment._id);
        expect(deletedComment).toBeNull();
    });
});
