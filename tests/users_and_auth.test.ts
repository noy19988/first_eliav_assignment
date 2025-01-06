import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import app from '../src/server'; // ייבוא היישום
import User from '../src/models/user';

let server: any;
let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
    // הפעלת השרת לצורך בדיקות
    server = app.listen(4000, () => console.log('Test server running on port 4000'));
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api');
});

afterAll(async () => {
    // סגירת השרת והחיבור למסד הנתונים
    await mongoose.connection.close();
    server.close();
});

describe('User and Auth Tests', () => {
    beforeEach(async () => {
        // ניקוי מסד הנתונים לפני כל בדיקה
        await User.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: hashedPassword,
        });
        await user.save();
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'testuser111',
                email: 'testuser111@example.com',
                password: 'password111',
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'User registered successfully' });
    });

    it('should not register a user with an existing email', async () => {
        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'anotheruser',
                email: 'testuser@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'User already exists' });
    });

    it('should log in with valid credentials', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
            });

        console.log('Login response:', response.body); // בדיקת תגובת ההתחברות

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                message: 'Login successful',
                token: expect.any(String),
                refreshToken: expect.any(String),
            }),
        );

        accessToken = response.body.token;
        refreshToken = response.body.refreshToken;
        console.log('Access Token:', accessToken); // בדיקת הטוקן שנוצר
    });

    it('should fail login with invalid credentials', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'wrongpassword',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Wrong password' });
    });

    it('should fetch all users with a valid token', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
            });

        const token = loginResponse.body.token;

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should fail to fetch all users without a token', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Access denied. No token provided.' });
    });

    it('should log out the user', async () => {
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
            });

        const validRefreshToken = loginResponse.body.refreshToken;
        console.log('Valid Refresh Token:', validRefreshToken); // בדיקת הטוקן שנשלח ל-Logout

        const response = await request(app)
            .post('/users/logout')
            .send({ refreshToken: validRefreshToken });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Logout successful' });
    });

    it('should fail to log out with an invalid refresh token', async () => {
        const response = await request(app)
            .post('/users/logout')
            .send({ refreshToken: 'invalidtoken' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Invalid refresh token' });
    });
});
