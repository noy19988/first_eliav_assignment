const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // ייבוא היישום
const User = require('../models/user');
const bcrypt = require('bcrypt');

let server;
let accessToken;
let refreshToken;

beforeAll(async () => {
    // הפעלת השרת לצורך בדיקות
    server = app.listen(4000, () => console.log('Test server running on port 4000'));
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
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

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            message: 'Login successful',
            token: expect.any(String),
            refreshToken: expect.any(String),
        }));
        accessToken = response.body.token;
        refreshToken = response.body.refreshToken;
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
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should fail to fetch all users without a token', async () => {
        const response = await request(app).get('/users');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Access denied. No token provided.' });
    });

    it('should log out the user', async () => {
        // ביצוע התחברות כדי לקבל refreshToken
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
            });
    
        const validRefreshToken = loginResponse.body.refreshToken;
    
        // שליחת בקשת logout עם refreshToken תקין
        const response = await request(app)
            .post('/users/logout')
            .send({ refreshToken: validRefreshToken });
    
        // בדיקת הצלחת הבקשה
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
