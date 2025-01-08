import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../src/server';
import Post from '../src/models/post';
import userModel, { IUser } from "../src/models/user";
import postModel from "../src/models/post";
dotenv.config();

let app: any;
let accessToken: string;
let testUser: string;

beforeAll(async () => {
    app = await initApp();
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-db', {});
    await userModel.deleteMany();
    await postModel.deleteMany();
    
    const registerResponse = await request(app).post('/users/register').send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });

    const loginResponse = await request(app).post('/users/login').send({
        email: 'testuser@example.com',
        password: 'password123',
    });

    accessToken = loginResponse.body.token;
    testUser = loginResponse.body.userId;
});

afterAll(async () => {
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
});

beforeEach(async () => {
    if (mongoose.connection.db) {
        await mongoose.connection.db.collection('posts').deleteMany({});
    }
});

describe('Posts API', () => {
    // בדיקה של יצירת פוסט
    test('should create a new post', async () => {
        const response = await request(app)
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
        const response = await request(app)
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
        const response = await request(app)
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
        const response1 = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Test Content',
                author: testUser,
            });
    
        const response2 = await request(app)
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
        const invalidPostId = new mongoose.Types.ObjectId();  // ID לא תקני (פוסט שלא קיים)
    
        const response = await request(app)
            .put(`/post/${invalidPostId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
    
        console.log("Response when post not found during update:", response.body);  // Debugging response
    
        expect(response.status).toBe(404);  // מצפה ל-404
        expect(response.body.message).toBe('Post not found');  // מצפה להודעה הזו
    });



    test('should return 404 if there is an error updating the post', async () => {
        const invalidPostId = new mongoose.Types.ObjectId();  // ID לא תקני
        
        const response = await request(app)
            .put(`/post/${invalidPostId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
    
        console.log("Response when error occurs during update:", response.body);  // Debugging response
    
        // מצפים ל-404 במקרה של שגיאה בעדכון
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');  // מצפה להודעת השגיאה הזו
    });
    
    
    

    // בדיקה של עדכון פוסט
    test('should update a post', async () => {
        const postResponse = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Old Title',
                content: 'Old Content',
                author: testUser,
            });
        
        const postId = postResponse.body.post._id;
        
        const response = await request(app)
            .put(`/post/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Title');
        expect(response.body.content).toBe('Updated Content');
    });


    test('should fail to refresh token with invalid refresh token or user', async () => {
        const invalidRefreshToken = 'invalidRefreshToken';
    
        console.log('Sending invalid refresh token:', invalidRefreshToken);  // הדפסת הלוג
    
        const response = await request(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
    
        // ציפייה לתגובה עם שגיאה (403)
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });
    

    // בדיקה של עדכון פוסט עם ID לא תקין
    test('should fail to update a post with invalid ID', async () => {
        const response = await request(app)
            .put('/post/invalidId')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'Updated Title', content: 'Updated Content' });
    
        console.log("Update Post with Invalid ID - Response:", response.body);
        expect(response.status).toBe(404);  // מצפה ל-404
        expect(response.body).toEqual({ message: 'Post not found' });  // מצפה להודעה הזו
    });



    test('should return 400 if title or content is missing', async () => {
        const response1 = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Content without title',
                author: testUser,
            });
    
        const response2 = await request(app)
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
        const postResponse = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'To be deleted',
                content: 'Will be deleted',
                author: testUser,
            });

        const postId = postResponse.body.post._id;
        
        const response = await request(app)
            .delete(`/post/${postId}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Post deleted successfully');
    });

    // בדיקה של מחיקת פוסט עם ID לא תקין
    test('should fail to delete a post with invalid ID', async () => {
        const response = await request(app)
            .delete('/post/invalidId')
            .set('Authorization', `Bearer ${accessToken}`);
    
        console.log("Delete Post with Invalid ID - Response:", response.body);
        expect(response.status).toBe(404);  // מצפה ל-404
        expect(response.body).toEqual({ message: 'Post not found' });  // מצפה להודעה הזו
    });

    // בדיקה אם הפוסט נוצר כראוי על פי נתונים
    test('should create a post successfully with valid title and content', async () => {
        const response = await request(app)
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
        const invalidPostId = new mongoose.Types.ObjectId();  // ID לא תקני
    
        const response = await request(app)
            .delete(`/post/${invalidPostId}`)
            .set('Authorization', `Bearer ${accessToken}`);
    
        console.log("Delete Post with Invalid ID - Response:", response.body);  // Debugging response
    
        // מצפים ל-404 במקרה שהפוסט לא נמצא
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });
    
});
