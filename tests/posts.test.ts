import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../src/server';
import Post from '../src/models/post';
import User from '../src/models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = initApp();
let token: string;
let userId: string;
let postId: string;
let testUser: any;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api');

    // יצירת משתמש בדיקה
    testUser = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });
    userId = testUser._id.toString();

    // יצירת טוקן
    token = jwt.sign({ userId: userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
});

afterAll(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
});

describe('Posts API Tests', () => {

    it('should create a new post', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png')); // נניח שיש לך תמונה בשם test-image.jpg בתיקייה __tests__

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('post');
        postId = response.body.post._id;
    });


    it('should handle generic error during save post', async () => {
        jest.spyOn(Post.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Generic save error');
        });
    
        const response = await request(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error saving/unsaving post');
    
        jest.spyOn(Post.prototype, 'save').mockRestore();
    });

    it('should get all posts', async () => {
        const response = await request(app).get('/posts');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });


    it('should handle unauthorized user during save post', async () => {
        const invalidToken = jwt.sign({ userId: 'invalidUserId' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
        const response = await request(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${invalidToken}`);
    
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });


    it('should handle unauthorized user during save post', async () => {
        const invalidToken = jwt.sign({ userId: 'invalidUserId' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
        const response = await request(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${invalidToken}`);
    
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    it('should update a post', async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(200);
        expect(response.body.post.recipeTitle).toBe('Updated Recipe');
    });


    it('should handle error during post delete', async () => {
        jest.spyOn(Post, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('Delete error');
        });
    
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error deleting post');
    
        jest.spyOn(Post, 'findByIdAndDelete').mockRestore();
    });


    it('should handle error during post update', async () => {
        jest.spyOn(Post, 'findByIdAndUpdate').mockImplementationOnce(() => {
            throw new Error('Update error');
        });
    
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error updating post');
    
        jest.spyOn(Post, 'findByIdAndUpdate').mockRestore();
    });
    
    it('should save a post', async () => {
        // יצירת פוסט חדש
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Save Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));

        expect(createResponse.status).toBe(201);

        const saveResponse = await request(app)
            .put(`/posts/${createResponse.body.post._id}/save`)
            .set('Authorization', `Bearer ${token}`);
        expect(saveResponse.status).toBe(200);
        expect(saveResponse.body.message).toBe('Post saved');
    });

    it('should get posts by user', async () => {
        const response = await request(app).get(`/posts/user/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });


    it('should not create a post without authentication', async () => {
        const response = await request(app)
            .post('/posts')
            .send({ recipeTitle: 'Test Recipe', category: ['test'], difficulty: 'easy', prepTime: 30, ingredients: ['ingredient1', 'ingredient2'], instructions: ['instruction1', 'instruction2'] });
        expect(response.status).toBe(403);
    });

    it('should not update a post with invalid ID', async () => {
        const response = await request(app)
            .put('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
        expect(response.status).toBe(400);
    });

    it('should not delete a post with invalid ID', async () => {
        const response = await request(app)
            .delete('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
    });

    it('should not save a post with invalid ID', async () => {
        const response = await request(app)
            .put('/posts/invalid-id/save')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
    });

    it('should not get posts by user with invalid user ID', async () => {
        const response = await request(app).get('/posts/user/invalid-id');
        expect(response.status).toBe(400);
    });

    it('should handle missing image file during post creation', async () => {
        const response = await request(app)
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
    });


    it('should handle missing image file during post update', async () => {
        // יצירת פוסט חדש לפני העדכון
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Update Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(createResponse.status).toBe(201);
    
        const updateResponse = await request(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });
    
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.post.recipeTitle).toBe('Updated Recipe');
    });

    it('should handle invalid JSON in category, ingredients, or instructions fields', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', 'invalid-json')
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', 'invalid-json')
            .field('instructions', 'invalid-json')
            .attach('image', path.join(__dirname, 'test-image.png'));

        expect(response.status).toBe(500);
    });

    it('should handle non-numeric prepTime field', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', 'invalid-prep-time')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));

        expect(response.status).toBe(500);
    });

    it('should handle user not found during post creation', async () => {
        const invalidToken = jwt.sign({ userId: 'invalidUserId' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${invalidToken}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });
    
    it('should handle invalid post ID during update', async () => {
        const response = await request(app)
            .put('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid post ID');
    });

    it('should handle post not found during update', async () => {
        const invalidPostId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .put(`/posts/${invalidPostId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ recipeTitle: 'Updated Recipe' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });


    it('should handle error during get all posts', async () => {
        jest.spyOn(Post, 'find').mockImplementationOnce(() => {
            throw new Error('Find error');
        });

        const response = await request(app).get('/posts');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching posts');

        jest.spyOn(Post, 'find').mockRestore();
    });

    it('should handle invalid post ID during delete', async () => {
        const response = await request(app)
            .delete('/posts/invalid-id')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Invalid post ID');
    });

    it('should handle post not found during delete', async () => {
        const invalidPostId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .delete(`/posts/${invalidPostId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });


    it('should handle post not found during save post', async () => {
        const invalidPostId = new mongoose.Types.ObjectId().toString();

        const response = await request(app)
            .put(`/posts/${invalidPostId}/save`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });

    it('should handle cast error during save post', async () => {
        const invalidPostId = 'invalidObjectId';

        const response = await request(app)
            .put(`/posts/${invalidPostId}/save`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });

    it('should handle error during save post', async () => {
        jest.spyOn(Post, 'findById').mockImplementationOnce(() => {
            throw new Error('Save error');
        });

        const response = await request(app)
            .put(`/posts/${postId}/save`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error saving/unsaving post');

        jest.spyOn(Post, 'findById').mockRestore();
    });

    it('should handle error during get posts by user', async () => {
        jest.spyOn(Post, 'find').mockImplementationOnce(() => {
            throw new Error('Find error');
        });

        const response = await request(app).get(`/posts/user/${userId}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching user posts');

        jest.spyOn(Post, 'find').mockRestore();
    });

    it('should handle error during post creation', async () => {
        jest.spyOn(Post.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Creation error');
        });
    
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error creating post');
    
        jest.spyOn(Post.prototype, 'save').mockRestore();
    });


    it('should handle error during post creation', async () => {
        jest.spyOn(Post.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Creation error');
        });

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error creating post');

        jest.spyOn(Post.prototype, 'save').mockRestore();
    });

    it('should handle post update with liked/unliked', async () => {
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Liked Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(createResponse.status).toBe(201);
    
        const updateLikedResponse = await request(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ liked: true });
    
        expect(updateLikedResponse.status).toBe(200);
        expect(updateLikedResponse.body.post.likes).toBe(1);
    
        const updateUnlikedResponse = await request(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ liked: false });
    
        expect(updateUnlikedResponse.status).toBe(200);
        expect(updateUnlikedResponse.body.post.likes).toBe(0);
    });
    

    it('should handle post update with saved/unsaved', async () => {
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Saved Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));

        expect(createResponse.status).toBe(201);

        const updateSavedResponse = await request(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ saved: true });

        expect(updateSavedResponse.status).toBe(200);
        expect(updateSavedResponse.body.post.savedBy).toContain(userId);

        const updateUnsavedResponse = await request(app)
            .put(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ saved: false });

        expect(updateUnsavedResponse.status).toBe(200);
        expect(updateUnsavedResponse.body.post.savedBy).not.toContain(userId);
    });

    it('should handle image deletion during post deletion', async () => {
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Delete Image Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(createResponse.status).toBe(201);
    
        const imagePath = path.join(__dirname, '../public/uploads', path.basename(createResponse.body.post.imageUrl));
        expect(fs.existsSync(imagePath)).toBe(true);
    
        const deleteResponse = await request(app)
            .delete(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`);
    
        expect(deleteResponse.status).toBe(200);
        expect(fs.existsSync(imagePath)).toBe(false);
    });

    it('should handle missing image file during post deletion', async () => {
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Delete No Image Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']));

        expect(createResponse.status).toBe(201);

        const deleteResponse = await request(app)
            .delete(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteResponse.status).toBe(200);
    });

    it('should handle error during get posts by user', async () => {
        jest.spyOn(Post, 'find').mockImplementationOnce(() => {
            throw new Error('Find error');
        });

        const response = await request(app).get(`/posts/user/${userId}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching user posts');

        jest.spyOn(Post, 'find').mockRestore();
    });


    it('should handle validation error during post creation', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', '') // שדה ריק כדי לגרום לשגיאת ולידציה
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation error');
    });



    it('should handle error during image deletion if file does not exist', async () => {
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('recipeTitle', 'Delete Image Test Recipe')
            .field('category', JSON.stringify(['test']))
            .field('difficulty', 'easy')
            .field('prepTime', '30')
            .field('ingredients', JSON.stringify(['ingredient1', 'ingredient2']))
            .field('instructions', JSON.stringify(['instruction1', 'instruction2']))
            .attach('image', path.join(__dirname, 'test-image.png'));
    
        expect(createResponse.status).toBe(201);
    
        // מוחקים את התמונה ידנית כדי לדמות מצב שהיא לא קיימת
        const imagePath = path.join(__dirname, '../public/uploads', path.basename(createResponse.body.post.imageUrl));
        fs.unlinkSync(imagePath);
    
        const deleteResponse = await request(app)
            .delete(`/posts/${createResponse.body.post._id}`)
            .set('Authorization', `Bearer ${token}`);
    
        expect(deleteResponse.status).toBe(200);
    });





    it('should handle generic error during get posts by user', async () => {
        jest.spyOn(Post, 'find').mockImplementationOnce(() => {
            throw new Error('Generic find error');
        });
    
        const response = await request(app).get(`/posts/user/${userId}`);
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching user posts');
    
        jest.spyOn(Post, 'find').mockRestore();
    });






    it('should handle generic error during get all posts', async () => {
        jest.spyOn(Post, 'find').mockImplementationOnce(() => {
            throw new Error('Generic find error');
        });
    
        const response = await request(app).get('/posts');
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching posts');
    
        jest.spyOn(Post, 'find').mockRestore();
    });it('should handle generic error during get all posts', async () => {
        jest.spyOn(Post, 'find').mockImplementationOnce(() => {
            throw new Error('Generic find error');
        });
    
        const response = await request(app).get('/posts');
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error fetching posts');
    
        jest.spyOn(Post, 'find').mockRestore();
    });



    it('should delete a post', async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);

        const getResponse = await request(app).get(`/posts/${postId}`);
        expect(getResponse.status).toBe(404);
    });



});