import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/server';
import Post from '../src/models/post';
import User, { IUser } from '../src/models/user';

let accessToken: string;
let testUser: string; // userId as string

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-db', {});

    // יצירת משתמש לדוגמה והרשמה
    await request(app).post('/users/register').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });

    // התחברות וקבלת accessToken
    const loginResponse = await request(app).post('/users/login').send({
        email: 'testuser@example.com',
        password: 'password123',
    });

    accessToken = loginResponse.body.token;

    // אחזור פרטי המשתמש מתוך הטוקן
    const decodedToken = jwt.decode(accessToken) as { userId: string };
    testUser = decodedToken.userId;
});

afterAll(async () => {
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Post.deleteMany({});
});

describe('Posts API', () => {
    it('should create a new post', async () => {
        const response = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Test Post',
                content: 'This is a test post.',
                author: testUser,
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            title: 'Test Post',
            content: 'This is a test post.',
            author: testUser,
        });
    });

    it('should fetch all posts', async () => {
        const post1 = new Post({ title: 'Post 1', content: 'Content 1', author: testUser });
        const post2 = new Post({ title: 'Post 2', content: 'Content 2', author: testUser });
        await post1.save();
        await post2.save();

        const response = await request(app).get('/post');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toMatchObject({ title: 'Post 1', content: 'Content 1' });
        expect(response.body[1]).toMatchObject({ title: 'Post 2', content: 'Content 2' });
    });

    it('should fetch a post by ID', async () => {
        const post = new Post({ title: 'Post by ID', content: 'Content by ID', author: testUser });
        await post.save();

        const response = await request(app).get(`/post/${post._id}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ title: 'Post by ID', content: 'Content by ID' });
    });

    it('should update a post', async () => {
        const post = new Post({ title: 'Old Title', content: 'Old Content', author: testUser });
        await post.save();

        const response = await request(app)
            .put(`/post/${post._id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ title: 'Updated Title', content: 'Updated Content' });
    });

    it('should delete a post', async () => {
        const post = new Post({ title: 'To be deleted', content: 'Will be deleted', author: testUser });
        await post.save();

        const response = await request(app)
            .delete(`/post/${post._id}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Post deleted successfully' });

        const deletedPost = await Post.findById(post._id);
        expect(deletedPost).toBeNull();
    });

    it('should fetch posts by author', async () => {
        const post1 = new Post({ title: 'Post 1', content: 'Content 1', author: testUser });
        const post2 = new Post({ title: 'Post 2', content: 'Content 2', author: testUser });
        await post1.save();
        await post2.save();

        const response = await request(app).get(`/post/sender/${testUser}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toMatchObject({ title: 'Post 1', content: 'Content 1' });
        expect(response.body[1]).toMatchObject({ title: 'Post 2', content: 'Content 2' });
    });
});
