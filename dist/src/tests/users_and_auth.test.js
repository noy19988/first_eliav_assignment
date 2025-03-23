"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
let app;
let accessToken;
let userId;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('beforeAll');
    app = yield (0, server_1.default)();
    yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test-db', {});
    yield user_1.default.deleteMany();
    yield post_1.default.deleteMany();
    const response = yield (0, supertest_1.default)(app)
        .post('/users/register')
        .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    const loginResponse = yield (0, supertest_1.default)(app)
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
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("afterAll");
    yield mongoose_1.default.connection.close();
}));
describe('User Controller Tests', () => {
    test('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'anotheruser',
            email: 'anotheruser@example.com',
            password: 'password456',
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    }));
    test('should fail to register a user with missing fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: '',
            email: 'missingfield@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    }));
    test('should fail to refresh token with invalid refresh token or user', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidRefreshToken = 'invalidRefreshToken';
        const response = yield (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    }));
    test('should fail to login with non-existent email', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'nonexistent@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    }));
    test('should fail to login with incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'newuser@example.com',
            password: 'wrongpassword',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Wrong password');
    }));
    test('should fail to register a user with an existing email', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'existinguser',
            email: 'newuser@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User already exists');
    }));
    test('should login with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'newuser@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
    }));
    test('should handle error when deleting old image fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const imagePath = path_1.default.join(__dirname, 'test-image.png');
        if (!fs_1.default.existsSync(imagePath)) {
            throw new Error(`Test image not found at ${imagePath}`);
        }
        const mockRenameSync = jest.spyOn(fs_1.default, 'renameSync');
        mockRenameSync.mockImplementationOnce(() => {
            // Simulate successful rename
        });
        const mockUnlinkSync = jest.spyOn(fs_1.default, 'unlinkSync');
        mockUnlinkSync.mockImplementationOnce(() => {
            throw new Error('Failed to delete old image');
        });
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .attach('profileImage', imagePath);
        expect(response.status).toBe(200);
        mockRenameSync.mockRestore();
        mockUnlinkSync.mockRestore();
    }));
    test('should get user details successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Testing getting user details for ID:", userId);
        const response = yield (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("Response status:", response.status);
        console.log("Response body:", response.body);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('newuser');
        expect(response.body.email).toBe('newuser@example.com');
    }));
    test('should fail to get user details with non-existent user ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        console.log("Testing getting user details for non-existent ID:", invalidUserId);
        const response = yield (0, supertest_1.default)(app)
            .get(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("Response status:", response.status);
        console.log("Response body:", response.body);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    }));
    it('should fail logout when no refresh token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({});
        expect(response.status).toBe(400); // שינוי ל-400
        expect(response.body.message).toBe('Refresh token is required');
    }));
    test('should fail to logout with invalid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidRefreshToken = 'invalidRefreshToken';
        const response = yield (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken: invalidRefreshToken })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid refresh token');
    }));
    test('should refresh the token successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'newuser@example.com',
            password: 'password123',
        });
        const refreshToken = loginResponse.body.refreshToken;
        const refreshResponse = yield (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken });
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body.token).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
    }));
    test('should logout the user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: "newuser@example.com",
            password: "password123"
        });
        const refreshToken = loginResponse.body.refreshToken;
        const logoutResponse = yield (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken })
            .set('Authorization', `Bearer ${refreshToken}`);
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Logout successful');
    }));
    test('should fail logout with invalid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken: 'invalidToken' })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid refresh token');
    }));
    test('should update username successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            username: 'updatedUser'
        });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUser');
        expect(response.body.email).toBe('newuser@example.com');
    }));
    test('should allow updating user with empty profile image field', () => __awaiter(void 0, void 0, void 0, function* () {
        // שמור את פרטי המשתמש המקוריים
        const originalResponse = yield (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        const originalImgUrl = originalResponse.body.imgUrl;
        // שלח בקשת PUT עם שם משתמש תקין ושדה תמונה ריק
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            username: 'validUsername', // שם משתמש תקין (לפחות 2 תווים)
        });
        expect(response.status).toBe(200);
        expect(response.body.imgUrl).toBe(originalImgUrl); // ודא ש-imgUrl לא השתנה
    }));
    test('should update user profile image successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const imagePath = path_1.default.join(__dirname, 'test-image.png');
        if (!fs_1.default.existsSync(imagePath)) {
            throw new Error(`Test image not found at ${imagePath}`);
        }
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .attach('profileImage', imagePath);
        expect(response.status).toBe(200);
        expect(response.body.imgUrl).toBeDefined();
        expect(response.body.imgUrl).toContain('/uploads/');
        // בדיקה שהקובץ אכן נשמר בשרת (מתוקן)
        const imageUrl = response.body.imgUrl;
        const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1); // Extract filename
        const savedImagePath = path_1.default.join('public', 'uploads', imageName);
        expect(fs_1.default.existsSync(savedImagePath)).toBe(true);
        // ניקוי קובץ התמונה
        fs_1.default.unlinkSync(savedImagePath);
    }));
    test('should fail to delete user with non-existent ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        const response = yield (0, supertest_1.default)(app)
            .delete(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    }));
    test('should fail to update user if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUserId = '677d9b8cc48f35c1eb52d444';
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            username: 'updatedUser',
            email: 'updateduser@example.com',
            password: 'newpassword123',
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    }));
    test('should fail to refresh token with invalid refresh token or user', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidRefreshToken = 'invalidRefreshToken';
        const response = yield (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    }));
    test('should fail to refresh token when no refresh token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/refresh')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Refresh token is required');
    }));
    test('should fail googleLogin with no token provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/google-login')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No Google token provided');
    }));
    test('should fail googleLogin with invalid google token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/google-login')
            .send({ token: 'invalidGoogleToken' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Google token');
    }));
    test('should update user with no data provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No data provided for update');
    }));
    test('should fail getUserDetails if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        // Force an error by mocking the findById function
        jest.spyOn(user_1.default, 'findById').mockImplementationOnce(() => {
            throw new Error('Database error');
        });
        const response = yield (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving user details');
        // Restore the original findById function
        jest.spyOn(user_1.default, 'findById').mockRestore();
    }));
    test('should handle registration error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Registration error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'errorUser',
            email: 'error@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error registering user');
        jest.spyOn(user_1.default.prototype, 'save').mockRestore();
    }));
    /*  test('should handle googleLogin error', async () => {
         jest.spyOn(client, 'verifyIdToken').mockImplementationOnce(() => {
             throw new Error('Google authentication error');
         });
 
         const response = await request(app)
             .post('/users/google-login')
             .send({ token: 'googleToken' });
 
         expect(response.status).toBe(500);
         expect(response.body.message).toBe('Error authenticating with Google');
 
         jest.spyOn(client, 'verifyIdToken').mockRestore();
     }); */
    test('should handle login error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findOne').mockImplementationOnce(() => {
            throw new Error('Login error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({ email: 'error@example.com', password: 'password123' });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging in');
        jest.spyOn(user_1.default, 'findOne').mockRestore();
    }));
    test('should fail googleLogin with invalid google token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/google-login')
            .send({ token: 'invalidGoogleToken' }); // טוקן לא תקין
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Google token');
    }));
    test('should update user with no data provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No data provided for update');
    }));
    test('should fail getUserDetails if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        // mocking User.findById to throw an error
        const findByIdMock = jest.spyOn(user_1.default, 'findById');
        findByIdMock.mockImplementationOnce(() => {
            throw new Error('Test Error');
        });
        const response = yield (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving user details');
        findByIdMock.mockRestore(); // Restore the original implementation
    }));
    test('should handle registration error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Registration error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'errorUser',
            email: 'error@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error registering user');
        jest.spyOn(user_1.default.prototype, 'save').mockRestore();
    }));
    test('should handle login error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findOne').mockImplementationOnce(() => {
            throw new Error('Login error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({ email: 'error@example.com', password: 'password123' });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging in');
        jest.spyOn(user_1.default, 'findOne').mockRestore();
    }));
    test('should delete a user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Deleting user with ID AT TEST:", userId);
        const response = yield (0, supertest_1.default)(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        console.log("the token is:", accessToken);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    }));
    test('should fail googleLogin with invalid google token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/users/google-login')
            .send({ token: 'invalidGoogleToken' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Google token');
    }));
    test('should update user with no data provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No data provided for update');
    }));
    test('should fail getUserDetails if an error occurs', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findById').mockImplementationOnce(() => {
            throw new Error('Test Error');
        });
        const response = yield (0, supertest_1.default)(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving user details');
        jest.spyOn(user_1.default, 'findById').mockRestore();
    }));
    test('should handle registration error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Registration error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'errorUser',
            email: 'error@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error registering user');
        jest.spyOn(user_1.default.prototype, 'save').mockRestore();
    }));
    test('should handle login error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findOne').mockImplementationOnce(() => {
            throw new Error('Login error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/login')
            .send({ email: 'error@example.com', password: 'password123' });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging in');
        jest.spyOn(user_1.default, 'findOne').mockRestore();
    }));
    /*  // New tests for missing coverage
     test('should handle googleLogin error when token verification fails', async () => {
         jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockImplementationOnce(() => {
             throw new Error('Token verification failed');
         });
 
         const response = await request(app)
             .post('/users/google-login')
             .send({ token: 'googleToken' });
 
         expect(response.status).toBe(500);
         expect(response.body.message).toBe('Error authenticating with Google');
 
         jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRestore();
     }); */
    test('should handle logout error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findOne').mockImplementationOnce(() => {
            throw new Error('Logout error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/users/logout')
            .send({ refreshToken: 'refreshToken' })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging out');
        jest.spyOn(user_1.default, 'findOne').mockRestore();
    }));
    /* test('should handle refreshToken error when token verification fails', async () => {
        jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
            throw new Error('Refresh token verification failed');
        });

        const response = await request(app)
            .post('/users/refresh')
            .send({ refreshToken: 'refreshToken' });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');

        jest.spyOn(jwt, 'verify').mockRestore();
    }); */
    test('should handle updateUser error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findByIdAndUpdate').mockImplementationOnce(() => {
            throw new Error('Update user error');
        });
        const response = yield (0, supertest_1.default)(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'updatedUsername' });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error updating user');
        jest.spyOn(user_1.default, 'findByIdAndUpdate').mockRestore();
    }));
    test('should handle deleteUser error', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(user_1.default, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('Delete user error');
        });
        const response = yield (0, supertest_1.default)(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error deleting user');
        jest.spyOn(user_1.default, 'findByIdAndDelete').mockRestore();
    }));
});
