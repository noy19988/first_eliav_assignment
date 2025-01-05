const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

let accessToken;
let testUser;
let testPost;

beforeAll(async () => {
    // התחברות למסד הנתונים
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // ניקוי מסד הנתונים וסגירת החיבור
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    // ניקוי אוספים רלוונטיים
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.collection('posts').deleteMany({});
    await mongoose.connection.collection('comments').deleteMany({});

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

    accessToken = loginResponse.body.token;

    // יצירת משתמש לדוגמה
    testUser = await User.findOne({ email: 'testuser@example.com' });

    // יצירת פוסט לדוגמה
    testPost = new Post({
        title: 'Test Post',
        content: 'Test Content',
        author: testUser._id,
    });
    await testPost.save();
});

describe('Comments API', () => {
    it('should create a new comment', async () => {
        const response = await request(app)
            .post('/comment')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Test Comment',
                postId: testPost._id,
                author: testUser._id, // שדה נוסף אם נדרש
            });
    
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            content: 'Test Comment',
            postId: testPost._id.toString(),
            author: testUser._id.toString(),
        });
    });

    it('should fetch comments by post ID', async () => {
        // יצירת שתי תגובות לדוגמה
        const comment1 = new Comment({
            content: 'Comment 1',
            postId: testPost._id,
            author: testUser._id,
        });
        const comment2 = new Comment({
            content: 'Comment 2',
            postId: testPost._id,
            author: testUser._id,
        });
        await comment1.save();
        await comment2.save();

        // בדיקה שמספר התגובות במסד הנתונים תואם לציפייה
        const allComments = await Comment.find({ postId: testPost._id });
        expect(allComments.length).toBe(2);

        // שליפת תגובות לפי postId
        const response = await request(app).get(`/comment/post/${testPost._id}`);

        // בדיקות
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toMatchObject({ content: 'Comment 1' });
        expect(response.body[1]).toMatchObject({ content: 'Comment 2' });
    });

    it('should update a comment', async () => {
        const comment = new Comment({
            content: 'Old Comment',
            postId: testPost._id,
            author: testUser._id,
        });
        await comment.save();

        const response = await request(app)
            .put(`/comment/${comment._id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Updated Comment' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ content: 'Updated Comment' });
    });

    it('should delete a comment', async () => {
        const comment = new Comment({
            content: 'Comment to delete',
            postId: testPost._id,
            author: testUser._id,
        });
        await comment.save();

        const response = await request(app)
            .delete(`/comment/${comment._id}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Comment deleted' });

        const deletedComment = await Comment.findById(comment._id);
        expect(deletedComment).toBeNull();
    });
});
