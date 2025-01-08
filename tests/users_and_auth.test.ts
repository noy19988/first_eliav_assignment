import dotenv from 'dotenv';
import request from 'supertest';
import initApp from '../src/server'; 
import mongoose from 'mongoose';
import * as usersController from '../src/controllers/usersController'; 
import userModel, { IUser } from "../src/models/user";
import postModel from "../src/models/post";
import { Console } from 'console';

dotenv.config();

let app: any;
let accessToken: string;
let userId: string;

beforeAll(async () => {
    console.log('beforeAll');
    app = await initApp(); // הפעלת השרת
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-db', {});
    await userModel.deleteMany();
    await postModel.deleteMany();

    const response = await request(app)
        .post('/users/register')
        .send({
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
        });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');

    const loginResponse = await request(app)
        .post('/users/login')
        .send({
            email: 'newuser@example.com',
            password: 'password123',
        });
    accessToken = loginResponse.body.token;
    console.log('userId token login:', loginResponse.body.token);
    userId = loginResponse.body.userId;
    console.log('Login response body:', loginResponse.body); // הוסף את זה כדי לראות את כל התגובה

    console.log('userId after login:', userId); // הדפס את ה-ID כדי לוודא שהוא לא undefined

});

afterAll(async () => {
    console.log("afterAll");
    await mongoose.connection.close(); // סגירת החיבור למסד נתונים
});

describe('User Controller Tests', () => {
    test('should register a new user', async () => {
        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'anotheruser',
                email: 'anotheruser@example.com',
                password: 'password456',
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    test('should fail to register a user with missing fields', async () => {
        const response = await request(app)
            .post('/users/register')
            .send({
                username: '', // חסר שם משתמש
                email: 'missingfield@example.com',
                password: 'password123',
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });



    test('should fail to refresh token with invalid refresh token or user', async () => {
        // צור טוקן רענון לא תקף
        const invalidRefreshToken = 'invalidRefreshToken';
    
        // שלח בקשה עם ה-refresh token השגוי
        const response = await request(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
    
        // ציפייה שהתגובה תהיה שגיאה עם קוד סטטוס 403
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });
    



    test('should fail to login with non-existent email', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should fail to login with incorrect password', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: 'newuser@example.com',
                password: 'wrongpassword', // סיסמה שגויה
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Wrong password');
    });
    

    test('should fail to register a user with an existing email', async () => {
        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'existinguser',
                email: 'newuser@example.com',  // Same as the first user
                password: 'password123',
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User already exists');
    });

    test('should login with valid credentials', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: 'newuser@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
    });


    test('should get user details successfully', async () => {
        console.log("Testing getting user details for ID:", userId); // הדפסה של ה-ID של המשתמש
        const response = await request(app)
            .get(`/users/${userId}`)  // שליחה של ה-ID הנכון
            .set('Authorization', `Bearer ${accessToken}`);  // צירוף טוקן הגישה
    
        console.log("Response status:", response.status); // הדפסה של סטטוס התגובה
        console.log("Response body:", response.body); // הדפסה של גוף התגובה
    
        expect(response.status).toBe(200);  // ציפייה למצב הצלחה
        expect(response.body.username).toBe('newuser');
        expect(response.body.email).toBe('newuser@example.com');
    });


    test('should fail to get user details with non-existent user ID', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444'; // ID לא קיים
        console.log("Testing getting user details for non-existent ID:", invalidUserId);
        
        const response = await request(app)
            .get(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);  // צירוף טוקן הגישה
    
        console.log("Response status:", response.status); // הדפסה של סטטוס התגובה
        console.log("Response body:", response.body); // הדפסה של גוף התגובה
    
        expect(response.status).toBe(404);  // ציפייה למצב של 'לא נמצא'
        expect(response.body.message).toBe('User not found');  // הודעה שהמשתמש לא נמצא
    });


    test('should fail to logout with invalid refresh token', async () => {
        const invalidRefreshToken = 'invalidRefreshToken'; // טוקן רענון לא תקני
    
        const response = await request(app)
            .post('/users/logout') // קריאה לפונקציית ההתנתקות
            .send({ refreshToken: invalidRefreshToken }) // שליחת הטוקן הלא תקני
            .set('Authorization', `Bearer ${accessToken}`); // צירוף טוקן גישה אם יש צורך בהזדהות
    
        expect(response.status).toBe(404); // ציפייה למצב של "לא נמצא"
        expect(response.body.message).toBe('Invalid refresh token'); // הודעת שגיאה המתארת את הבעיה
    });
    
    
    
    
    

    test('should refresh the token successfully', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: 'newuser@example.com',
                password: 'password123',
            });
        const refreshToken = loginResponse.body.refreshToken;
    
        const refreshResponse = await request(app)
            .post('/users/refresh')
            .send({ refreshToken });
    
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body.token).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
    });
    

    test('should logout the user successfully', async () => {
        // שולחים את בקשת ההתנתקות עם ה-refreshToken
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: "newuser@example.com",
                password: "password123"
            });
    
        const refreshToken = loginResponse.body.refreshToken;
    
        // עכשיו, שלח את הבקשה להתנתקות עם ה-refreshToken
        const logoutResponse = await request(app)
            .post('/users/logout')
            .send({ refreshToken })  // לוודא שה-refreshToken נשלח כראוי
            .set('Authorization', `Bearer ${refreshToken}`); // צירוף ה-Authorization header עם ה-refreshToken
    
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Logout successful');
    });
    

    test('should fail logout with invalid refresh token', async () => {
        const response = await request(app)
            .post('/users/logout')
            .send({ refreshToken: 'invalidToken' })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid refresh token');
    });

    test('should update user details successfully', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: 'updatedUser',
                email: 'updateduser@example.com',
                password: 'newpassword123', // עדכון סיסמה
            });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUser');
        expect(response.body.email).toBe('updateduser@example.com');
    });
    

    test('should fail to update user details with missing fields', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: '', // חסר שם משתמש
                email: '', // חסר מייל
            });
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('At least one field must be provided for update'); // עדכון כאן להודעה הנכונה
    });
    
    

    test('should update username and email successfully', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: 'updatedUser',  // עדכון שם משתמש
                email: 'updated@example.com',  // עדכון מייל
            });
    
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUser');
        expect(response.body.email).toBe('updated@example.com');
    });
    

    
    

    test('should delete a user successfully', async () => {
        // הדפסת ה-`userId` כדי לוודא שהוא לא undefined
        console.log("Deleting user with ID AT TEST:", userId);
    
        const response = await request(app)
            .delete(`/users/${userId}`)  // נשלח את ה-ID
            .set('Authorization', `Bearer ${accessToken}`);  // צירוף טוקן ההרשאה
        console.log("the token is:", accessToken);

        // ציפייה שהתוצאה תהיה הצלחה
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });


    test('should fail to delete user with non-existent ID', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        const response = await request(app)
            .delete(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    

    test('should fail to update user if user not found', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';  // ID לא קיים
    
        const response = await request(app)
            .put(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`)  // צירוף טוקן גישה
            .send({
                username: 'updatedUser',
                email: 'updateduser@example.com',
                password: 'newpassword123',
            });
    
        // ציפייה למצב של "משתמש לא נמצא"
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });


    test('should fail to refresh token with invalid refresh token or user', async () => {
        // צור טוקן רענון לא תקף
        const invalidRefreshToken = 'invalidRefreshToken';
        
        // שלח בקשה עם ה-refresh token השגוי
        const response = await request(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        
        // ציפייה שהתגובה תהיה שגיאה עם קוד סטטוס 403
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });



    test('should fail to refresh token when no refresh token is provided', async () => {
        // שלח בקשה בלי לשלוח את ה-refresh token
        const response = await request(app)
            .post('/users/refresh')
            .send({});
        
        // ציפייה שהתגובה תהיה שגיאה עם קוד סטטוס 400
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Refresh token is required');
    });
    
    


    
    
    
});



