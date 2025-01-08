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
    app = await (0, server_1.default)();
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
    console.log('Login response body:', loginResponse.body);
    console.log('userId after login:', userId);
});
afterAll(async () => {
    console.log("afterAll");
    await mongoose_1.default.connection.close();
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
            username: '',
            email: 'missingfield@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });
    test('should fail to refresh token with invalid refresh token or user', async () => {
        const invalidRefreshToken = 'invalidRefreshToken';
        const response = await (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
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
            password: 'wrongpassword',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Wrong password');
    });
    test('should fail to register a user with an existing email', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'existinguser',
            email: 'newuser@example.com',
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
        console.log("Testing getting user details for ID:", userId);
        const response = await (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("Response status:", response.status);
        console.log("Response body:", response.body);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('newuser');
        expect(response.body.email).toBe('newuser@example.com');
    });
    test('should fail to get user details with non-existent user ID', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        console.log("Testing getting user details for non-existent ID:", invalidUserId);
        const response = await (0, supertest_1.default)(app)
            .get(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("Response status:", response.status);
        console.log("Response body:", response.body);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    test('should fail to logout with invalid refresh token', async () => {
        const invalidRefreshToken = 'invalidRefreshToken';
        const response = await (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken: invalidRefreshToken })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid refresh token');
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
        const loginResponse = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: "newuser@example.com",
            password: "password123"
        });
        const refreshToken = loginResponse.body.refreshToken;
        const logoutResponse = await (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken })
            .set('Authorization', `Bearer ${refreshToken}`);
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
            password: 'newpassword123',
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
            username: '',
            email: '',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('At least one field must be provided for update');
    });
    test('should update username and email successfully', async () => {
        const response = await (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            username: 'updatedUser',
            email: 'updated@example.com',
        });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUser');
        expect(response.body.email).toBe('updated@example.com');
    });
    test('should delete a user successfully', async () => {
        console.log("Deleting user with ID AT TEST:", userId);
        const response = await (0, supertest_1.default)(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("the token is:", accessToken);
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
    test('should fail to update user if user not found', async () => {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        const response = await (0, supertest_1.default)(app)
            .put(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            username: 'updatedUser',
            email: 'updateduser@example.com',
            password: 'newpassword123',
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    test('should fail to refresh token with invalid refresh token or user', async () => {
        const invalidRefreshToken = 'invalidRefreshToken';
        const response = await (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });
    test('should fail to refresh token when no refresh token is provided', async () => {
        const response = await (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Refresh token is required');
    });
});
