"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../src/server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../src/models/user"));
const post_1 = __importDefault(require("../src/models/post"));
dotenv_1.default.config();
let app;
let accessToken;
let userId;
beforeAll(async () => {
    console.log('beforeAll');
    app = await (0, server_1.default)(); // הפעלת השרת
    await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-db', {});
    await user_1.default.deleteMany();
    await post_1.default.deleteMany();
    const response = await (0, supertest_1.default)(app)
        .post('/users/register')
        .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    const loginResponse = await (0, supertest_1.default)(app)
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
    await mongoose_1.default.connection.close(); // סגירת החיבור למסד נתונים
});
describe('User Controller Tests', () => {
    test('should register a new user', async () => {
        const response = await (0, supertest_1.default)(app)
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
        const response = await (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: '', // חסר שם משתמש
            email: 'missingfield@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });
    test('should fail to login with non-existent email', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'nonexistent@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    test('should fail to login with incorrect password', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'newuser@example.com',
            password: 'wrongpassword', // סיסמה שגויה
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Wrong password');
    });
    test('should fail to register a user with an existing email', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'existinguser',
            email: 'newuser@example.com', // Same as the first user
            password: 'password123',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User already exists');
    });
    test('should login with valid credentials', async () => {
        const response = await (0, supertest_1.default)(app)
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
        const response = await (0, supertest_1.default)(app)
            .get(`/users/${userId}`) // שליחה של ה-ID הנכון
            .set('Authorization', `Bearer ${accessToken}`); // צירוף טוקן הגישה
        console.log("Response status:", response.status); // הדפסה של סטטוס התגובה
        console.log("Response body:", response.body); // הדפסה של גוף התגובה
        expect(response.status).toBe(200); // ציפייה למצב הצלחה
        expect(response.body.username).toBe('newuser');
        expect(response.body.email).toBe('newuser@example.com');
    });
    test('should fail to get user details with non-existent user ID', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444'; // ID לא קיים
        console.log("Testing getting user details for non-existent ID:", invalidUserId);
        const response = await (0, supertest_1.default)(app)
            .get(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`); // צירוף טוקן הגישה
        console.log("Response status:", response.status); // הדפסה של סטטוס התגובה
        console.log("Response body:", response.body); // הדפסה של גוף התגובה
        expect(response.status).toBe(404); // ציפייה למצב של 'לא נמצא'
        expect(response.body.message).toBe('User not found'); // הודעה שהמשתמש לא נמצא
    });
    test('should fail to get user details with invalid token', async () => {
        const invalidToken = 'invalidToken'; // טוקן שגוי
        console.log("Testing getting user details with invalid token for ID:", userId);
        const response = await (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${invalidToken}`); // שליחה עם טוקן שגוי
        console.log("Response status:", response.status); // הדפסה של סטטוס התגובה
        console.log("Response body:", response.body); // הדפסה של גוף התגובה
        expect(response.status).toBe(403); // ציפייה למצב של 'אסור גישה'
        expect(response.body.message).toBe('Invalid or expired token.'); // הודעה של טוקן שגוי
    });
    test('should refresh the token successfully', async () => {
        const loginResponse = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'newuser@example.com',
            password: 'password123',
        });
        const refreshToken = loginResponse.body.refreshToken;
        const refreshResponse = await (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken });
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body.token).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
    });
    test('should logout the user successfully', async () => {
        // שולחים את בקשת ההתנתקות עם ה-refreshToken
        const loginResponse = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: "newuser@example.com",
            password: "password123"
        });
        const refreshToken = loginResponse.body.refreshToken;
        // עכשיו, שלח את הבקשה להתנתקות עם ה-refreshToken
        const logoutResponse = await (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken });
        // ציפייה למצב הצלחה
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Logout successful');
    });
    test('should fail logout with invalid refresh token', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken: 'invalidToken' })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid refresh token');
    });
    test('should update user details successfully', async () => {
        const response = await (0, supertest_1.default)(app)
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
        const response = await (0, supertest_1.default)(app)
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
        const response = await (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            username: 'updatedUser', // עדכון שם משתמש
            email: 'updated@example.com', // עדכון מייל
        });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUser');
        expect(response.body.email).toBe('updated@example.com');
    });
    test('should delete a user successfully', async () => {
        // הדפסת ה-`userId` כדי לוודא שהוא לא undefined
        console.log("Deleting user with ID AT TEST:", userId);
        const response = await (0, supertest_1.default)(app)
            .delete(`/users/${userId}`) // נשלח את ה-ID
            .set('Authorization', `Bearer ${accessToken}`); // צירוף טוקן ההרשאה
        console.log("the token is:", accessToken);
        // ציפייה שהתוצאה תהיה הצלחה
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
    test('should fail to delete user with non-existent ID', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        const response = await (0, supertest_1.default)(app)
            .delete(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
});
