"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../src/server"));
const user_1 = __importDefault(require("../src/models/user"));
const post_1 = __importDefault(require("../src/models/post"));
dotenv_1.default.config();
let app;
let accessToken;
let testUser;
beforeAll(async () => {
    app = await (0, server_1.default)();
    await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-db', {});
    await user_1.default.deleteMany();
    await post_1.default.deleteMany();
    const registerResponse = await (0, supertest_1.default)(app).post('/users/register').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });
    const loginResponse = await (0, supertest_1.default)(app).post('/users/login').send({
        email: 'testuser@example.com',
        password: 'password123',
    });
    accessToken = loginResponse.body.token;
    testUser = loginResponse.body.userId;
});
afterAll(async () => {
    if (mongoose_1.default.connection.db) {
        await mongoose_1.default.connection.db.dropDatabase();
    }
    await mongoose_1.default.connection.close();
});
beforeEach(async () => {
    if (mongoose_1.default.connection.db) {
        await mongoose_1.default.connection.db.collection('posts').deleteMany({});
    }
});
describe('Posts API', () => {
    // בדיקה של יצירת פוסט
    test('should create a new post', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Test Post',
            content: 'This is a test post.',
            author: testUser,
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Post created successfully');
        expect(response.body.post.title).toBe('Test Post');
        expect(response.body.post.content).toBe('This is a test post.');
        expect(response.body.post.author).toBe(testUser);
    });
    // בדיקה אם הפוסט נכשל אם הכותרת ריקה
    test('should fail to create a post if title is empty', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'Test Content',
            author: testUser,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Title and Content are required');
    });
    // בדיקה אם הפוסט נכשל אם התוכן ריק
    test('should fail to create a post if content is empty', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Test Post',
            author: testUser,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Title and Content are required');
    });
    test('should fail to create a post if title or content is missing', async () => {
        const response1 = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'Test Content',
            author: testUser,
        });
        const response2 = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Test Title',
            author: testUser,
        });
        expect(response1.status).toBe(400);
        expect(response1.body.message).toBe('Title and Content are required');
        expect(response2.status).toBe(400);
        expect(response2.body.message).toBe('Title and Content are required');
    });
    test('should return 404 if post not found during update', async () => {
        const invalidPostId = new mongoose_1.default.Types.ObjectId(); // ID לא תקני (פוסט שלא קיים)
        const response = await (0, supertest_1.default)(app)
            .put(`/post/${invalidPostId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
        console.log("Response when post not found during update:", response.body); // Debugging response
        expect(response.status).toBe(404); // מצפה ל-404
        expect(response.body.message).toBe('Post not found'); // מצפה להודעה הזו
    });
    test('should return 404 if there is an error updating the post', async () => {
        const invalidPostId = new mongoose_1.default.Types.ObjectId(); // ID לא תקני
        const response = await (0, supertest_1.default)(app)
            .put(`/post/${invalidPostId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
        console.log("Response when error occurs during update:", response.body); // Debugging response
        // מצפים ל-404 במקרה של שגיאה בעדכון
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found'); // מצפה להודעת השגיאה הזו
    });
    // בדיקה של עדכון פוסט
    test('should update a post', async () => {
        const postResponse = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Old Title',
            content: 'Old Content',
            author: testUser,
        });
        const postId = postResponse.body.post._id;
        const response = await (0, supertest_1.default)(app)
            .put(`/post/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Title');
        expect(response.body.content).toBe('Updated Content');
    });
    test('should fail to refresh token with invalid refresh token or user', async () => {
        const invalidRefreshToken = 'invalidRefreshToken';
        console.log('Sending invalid refresh token:', invalidRefreshToken); // הדפסת הלוג
        const response = await (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        // ציפייה לתגובה עם שגיאה (403)
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });
    // בדיקה של עדכון פוסט עם ID לא תקין
    test('should fail to update a post with invalid ID', async () => {
        const response = await (0, supertest_1.default)(app)
            .put('/post/invalidId')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
        console.log("Update Post with Invalid ID - Response:", response.body);
        expect(response.status).toBe(404); // מצפה ל-404
        expect(response.body).toEqual({ message: 'Post not found' }); // מצפה להודעה הזו
    });
    test('should return 400 if title or content is missing', async () => {
        const response1 = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'Content without title',
            author: testUser,
        });
        const response2 = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Title without content',
            author: testUser,
        });
        expect(response1.status).toBe(400);
        expect(response1.body.message).toBe('Title and Content are required');
        expect(response2.status).toBe(400);
        expect(response2.body.message).toBe('Title and Content are required');
    });
    // בדיקה של מחיקת פוסט
    test('should delete a post', async () => {
        const postResponse = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'To be deleted',
            content: 'Will be deleted',
            author: testUser,
        });
        const postId = postResponse.body.post._id;
        const response = await (0, supertest_1.default)(app)
            .delete(`/post/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Post deleted successfully');
    });
    // בדיקה של מחיקת פוסט עם ID לא תקין
    test('should fail to delete a post with invalid ID', async () => {
        const response = await (0, supertest_1.default)(app)
            .delete('/post/invalidId')
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("Delete Post with Invalid ID - Response:", response.body);
        expect(response.status).toBe(404); // מצפה ל-404
        expect(response.body).toEqual({ message: 'Post not found' }); // מצפה להודעה הזו
    });
    // בדיקה אם הפוסט נוצר כראוי על פי נתונים
    test('should create a post successfully with valid title and content', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Another Test Post',
            content: 'Content for another post.',
            author: testUser,
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Post created successfully');
        expect(response.body.post.title).toBe('Another Test Post');
        expect(response.body.post.content).toBe('Content for another post.');
    });
    test('should return 404 if post not found during delete', async () => {
        // יצירת ID לא תקני שיכלול פוסט לא קיים
        const invalidPostId = new mongoose_1.default.Types.ObjectId(); // ID לא תקני
        const response = await (0, supertest_1.default)(app)
            .delete(`/post/${invalidPostId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("Delete Post with Invalid ID - Response:", response.body); // Debugging response
        // מצפים ל-404 במקרה שהפוסט לא נמצא
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });
});
