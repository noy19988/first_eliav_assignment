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
    // בדיקה אם הפוסט לא נמצא לפי מזהה
    // test('should return 400 if post ID is not valid for fetching a post', async () => {
    //     const response = await request(app).get('/post/invalidId');
    //     expect(response.status).toBe(400);
    //     expect(response.body).toEqual({ message: 'Invalid ID format' });
    // });
    // test("Test get posts by sender", async () => {
    //     console.log("testUser is:", testUser);
    //     // צור פוסט כדי לוודא שאתה משתמש במזהה פוסט חוקי
    //     const createPostResponse = await request(app)
    //         .post('/posts')
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .send({
    //             title: 'Test Post',
    //             content: 'Test Content.',
    //             author: testUser.toString(),  // משתמש במזהה של המשתמש
    //         });
    //     const postId = createPostResponse.body._id;  // שמירה על ה-ID של הפוסט שנוצר
    //     // שלח בקשה לקבלת פוסטים מהמשתמש
    //     const response = await request(app).get(`/posts/sender/${testUser.toString()}`);  // שימוש ב-path parameter
    //     expect(response.statusCode).toBe(200);
    //     expect(response.body.length).toBe(1);
    //     expect(response.body[0].title).toBe('Test Post');
    //     expect(response.body[0].content).toBe('Test Content');
    // });
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
    // בדיקה של קבלת פוסטים לפי שולח (sender)
    // test('should fetch no posts if no posts match the sender', async () => {
    //     const response = await request(app).get('/posts/author/invalidUserId');
    //     console.log("Fetch Posts by Sender - Response:", response.body);
    //     expect(response.status).toBe(404);  // מצפה ל-404
    //     expect(response.body).toEqual({ message: 'No posts found for sender: invalidUserId' });
    // });
    // בדיקה של הגבלת מספר הפוסטים המוחזרים
    // test('should limit the number of posts returned with the limit query parameter', async () => {
    //     const post1 = new Post({ title: 'Post 1', content: 'Content 1', author: testUser });
    //     const post2 = new Post({ title: 'Post 2', content: 'Content 2', author: testUser });
    //     const post3 = new Post({ title: 'Post 3', content: 'Content 3', author: testUser });
    //     await post1.save();
    //     await post2.save();
    //     await post3.save();
    //     const response = await request(app).get('/post?limit=2');
    //     expect(response.status).toBe(200);
    //     expect(response.body.length).toBe(2);
    // });
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
});
