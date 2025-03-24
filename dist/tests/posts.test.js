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
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../src/server"));
const post_1 = __importDefault(require("../src/models/post"));
const user_1 = __importDefault(require("../src/models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, server_1.default)();
let token;
let userId;
let postId;
let testUser;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api');
    // יצירת משתמש בדיקה
    testUser = yield user_1.default.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });
    userId = testUser._id.toString();
    // יצירת טוקן
    token = jsonwebtoken_1.default.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield post_1.default.deleteMany({});
    yield user_1.default.deleteMany({});
    yield mongoose_1.default.disconnect();
}));
describe('Posts API Tests', () => {
    it('should create a new post', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png')); // נניח שיש לך תמונה בשם test-image.jpg בתיקייה __tests__
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('post');
        postId = response.body.post._id;
    }));
    it('should handle generic error during save post', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Generic save error');
        });
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error saving/unsaving post');
        jest.spyOn(post_1.default.prototype, 'save').mockRestore();
    }));
    it('should get all posts', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/posts');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    }));
    it('should handle unauthorized user during save post', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidToken = jsonwebtoken_1.default.sign({ userId: 'invalidUserId' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    }));
    it('should handle unauthorized user during save post', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidToken = jsonwebtoken_1.default.sign({ userId: 'invalidUserId' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    }));
    it('should update a post', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(200);
        expect(response.body.post.recipeTitle).toBe('Updated Recipe');
    }));
    it('should handle error during post delete', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('Delete error');
        });
        const response = yield (0, supertest_1.default)(app)
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error deleting post');
        jest.spyOn(post_1.default, 'findByIdAndDelete').mockRestore();
    }));
    it('should handle error during post update', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'findByIdAndUpdate').mockImplementationOnce(() => {
            throw new Error('Update error');
        });
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error updating post');
        jest.spyOn(post_1.default, 'findByIdAndUpdate').mockRestore();
    }));
    it('should save a post', () => __awaiter(void 0, void 0, void 0, function* () {
        // יצירת פוסט חדש
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Save Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(createResponse.status).toBe(201);
        const saveResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createResponse.body.post._id}/save`)
            .set('Authorization', `Bearer ${token}`);
        expect(saveResponse.status).toBe(200);
        expect(saveResponse.body.message).toBe('Post saved');
    }));
    it('should get posts by user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/posts/user/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    }));
    it('should not create a post without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .send({ recipeTitle: 'Test Recipe', category: ['test'], difficulty: 'easy', prepTime: 30, ingredients: ['ingredient1', 'ingredient2'], instructions: ['instruction1', 'instruction2'] });
        expect(response.status).toBe(403);
    }));
    it('should not update a post with invalid ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(400);
    }));
    it('should not delete a post with invalid ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
    }));
    it('should not save a post with invalid ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put('/posts/invalid-id/save')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
    }));
    it('should not get posts by user with invalid user ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/posts/user/invalid-id');
        expect(response.status).toBe(400);
    }));
    it('should handle missing image file during post creation', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']));
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('post');
        expect(response.body.post.imageUrl).toBe("");
    }));
    it('should handle missing image file during post update', () => __awaiter(void 0, void 0, void 0, function* () {
        // יצירת פוסט חדש לפני העדכון
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Update Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(createResponse.status).toBe(201);
        const updateResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.post.recipeTitle).toBe('Updated Recipe');
    }));
    it('should handle invalid JSON in category, ingredients, or instructions fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', 'invalid-json')
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', 'invalid-json')
            .field('instructions', 'invalid-json')
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(response.status).toBe(500);
    }));
    it('should handle non-numeric prepTime field', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', 'invalid-prep-time')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(response.status).toBe(500);
    }));
    it('should handle user not found during post creation', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidToken = jsonwebtoken_1.default.sign({ userId: 'invalidUserId' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${invalidToken}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    }));
    it('should handle invalid post ID during update', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid post ID');
    }));
    it('should handle post not found during update', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidPostId = new mongoose_1.default.Types.ObjectId().toString();
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${invalidPostId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    }));
    it('should handle error during get all posts', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'find').mockImplementationOnce(() => {
            throw new Error('Find error');
        });
        const response = yield (0, supertest_1.default)(app).get('/posts');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching posts');
        jest.spyOn(post_1.default, 'find').mockRestore();
    }));
    it('should handle invalid post ID during delete', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid post ID');
    }));
    it('should handle post not found during delete', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidPostId = new mongoose_1.default.Types.ObjectId().toString();
        const response = yield (0, supertest_1.default)(app)
            .delete(`/posts/${invalidPostId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    }));
    it('should handle post not found during save post', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidPostId = new mongoose_1.default.Types.ObjectId().toString();
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${invalidPostId}/save`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    }));
    it('should handle cast error during save post', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidPostId = 'invalidObjectId';
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${invalidPostId}/save`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    }));
    it('should handle error during save post', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'findById').mockImplementationOnce(() => {
            throw new Error('Save error');
        });
        const response = yield (0, supertest_1.default)(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error saving/unsaving post');
        jest.spyOn(post_1.default, 'findById').mockRestore();
    }));
    it('should handle error during get posts by user', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'find').mockImplementationOnce(() => {
            throw new Error('Find error');
        });
        const response = yield (0, supertest_1.default)(app).get(`/posts/user/${userId}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching user posts');
        jest.spyOn(post_1.default, 'find').mockRestore();
    }));
    it('should handle error during post creation', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Creation error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error creating post');
        jest.spyOn(post_1.default.prototype, 'save').mockRestore();
    }));
    it('should handle error during post creation', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Creation error');
        });
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error creating post');
        jest.spyOn(post_1.default.prototype, 'save').mockRestore();
    }));
    it('should handle post update with liked/unliked', () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Liked Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(createResponse.status).toBe(201);
        const updateLikedResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ liked: true });
        expect(updateLikedResponse.status).toBe(200);
        expect(updateLikedResponse.body.post.likes).toBe(1);
        const updateUnlikedResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ liked: false });
        expect(updateUnlikedResponse.status).toBe(200);
        expect(updateUnlikedResponse.body.post.likes).toBe(0);
    }));
    it('should handle post update with saved/unsaved', () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Saved Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(createResponse.status).toBe(201);
        const updateSavedResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ saved: true });
        expect(updateSavedResponse.status).toBe(200);
        expect(updateSavedResponse.body.post.savedBy).toContain(userId);
        const updateUnsavedResponse = yield (0, supertest_1.default)(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ saved: false });
        expect(updateUnsavedResponse.status).toBe(200);
        expect(updateUnsavedResponse.body.post.savedBy).not.toContain(userId);
    }));
    it('should handle image deletion during post deletion', () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Delete Image Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(createResponse.status).toBe(201);
        const imagePath = path_1.default.join(__dirname, '../public/uploads', path_1.default.basename(createResponse.body.post.imageUrl));
        expect(fs_1.default.existsSync(imagePath)).toBe(true);
        const deleteResponse = yield (0, supertest_1.default)(app)
            .delete(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteResponse.status).toBe(200);
        expect(fs_1.default.existsSync(imagePath)).toBe(false);
    }));
    it('should handle missing image file during post deletion', () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Delete No Image Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']));
        expect(createResponse.status).toBe(201);
        const deleteResponse = yield (0, supertest_1.default)(app)
            .delete(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteResponse.status).toBe(200);
    }));
    it('should handle error during get posts by user', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'find').mockImplementationOnce(() => {
            throw new Error('Find error');
        });
        const response = yield (0, supertest_1.default)(app).get(`/posts/user/${userId}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching user posts');
        jest.spyOn(post_1.default, 'find').mockRestore();
    }));
    it('should handle validation error during post creation', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', '') // שדה ריק כדי לגרום לשגיאת ולידציה
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation error');
    }));
    it('should handle error during image deletion if file does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const createResponse = yield (0, supertest_1.default)(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Delete Image Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path_1.default.join(__dirname, 'test-image.png'));
        expect(createResponse.status).toBe(201);
        // מוחקים את התמונה ידנית כדי לדמות מצב שהיא לא קיימת
        const imagePath = path_1.default.join(__dirname, '../public/uploads', path_1.default.basename(createResponse.body.post.imageUrl));
        fs_1.default.unlinkSync(imagePath);
        const deleteResponse = yield (0, supertest_1.default)(app)
            .delete(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteResponse.status).toBe(200);
    }));
    it('should handle generic error during get posts by user', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'find').mockImplementationOnce(() => {
            throw new Error('Generic find error');
        });
        const response = yield (0, supertest_1.default)(app).get(`/posts/user/${userId}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching user posts');
        jest.spyOn(post_1.default, 'find').mockRestore();
    }));
    it('should handle generic error during get all posts', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'find').mockImplementationOnce(() => {
            throw new Error('Generic find error');
        });
        const response = yield (0, supertest_1.default)(app).get('/posts');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching posts');
        jest.spyOn(post_1.default, 'find').mockRestore();
    }));
    it('should handle generic error during get all posts', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(post_1.default, 'find').mockImplementationOnce(() => {
            throw new Error('Generic find error');
        });
        const response = yield (0, supertest_1.default)(app).get('/posts');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching posts');
        jest.spyOn(post_1.default, 'find').mockRestore();
    }));
    it('should delete a post', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        const getResponse = yield (0, supertest_1.default)(app).get(`/posts/${postId}`);
        expect(getResponse.status).toBe(404);
    }));
});
//# sourceMappingURL=posts.test.js.map