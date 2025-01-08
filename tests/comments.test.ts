import request from 'supertest';
import mongoose from 'mongoose';
import initApp from '../src/server';
import { Express } from 'express';
import UserModel from '../src/models/user';
import PostModel from '../src/models/post';
import CommentsModel from '../src/models/comment';
import * as commentsController from '../src/controllers/commentsController';
import testComments from "../tests/test_comments.json";
import commentsRoutes from '../src/routes/commentsRoutes';
import { loginUser } from '../src/controllers/usersController';

var app: Express;
let accessToken: string;
let testUser: mongoose.Types.ObjectId;
let testPost: mongoose.Types.ObjectId;
let commentId = "";
let post_id: mongoose.Types.ObjectId;

beforeAll(async () => {
    app = await initApp() as Express;
    app.use('/comments', commentsRoutes);

    await UserModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommentsModel.deleteMany({});

    const userResponse = await request(app)
        .post('/users/register')
        .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });
    expect(userResponse.status).toBe(201);

    const loginResponse = await request(app)
        .post('/users/login')
        .send({
            email: 'testuser@example.com',
            password: 'password123',
        });
    accessToken = loginResponse.body.token;

    const user = await UserModel.findOne({ email: 'testuser@example.com' });
    if (user) {
        testUser = user._id as unknown as mongoose.Types.ObjectId;
    }
    const response = await request(app)
        .post('/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
            title: 'Test Post',
            content: 'Test Content.',
            author: testUser,
            });

    post_id = response.body.post._id;

    expect(response.status).toBe(201);

    console.log('User ID:', testUser);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Comments API', () => {
    test("Test Create Comment", async () => {
        testComments[0].postId = post_id.toString();
        testComments[0].author = testUser.toString();
        const response = await request(app).post("/comments").set('Authorization', `Bearer ${accessToken}`).send(testComments[0]);
        console.log('body',response.body);
        console.log('access token:', accessToken);
        console.log('test comments [0]:',testComments[0].content);
        expect(response.statusCode).toBe(201);
        commentId = response.body._id;
      });

    test("Should create a comment with valid data", async () => {
        testComments[0].postId = post_id.toString();
        testComments[0].author = testUser.toString();
    
        const response = await request(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(testComments[0]);
    
        console.log('body:', response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body.postId).toBe(post_id.toString());
        expect(response.body.author).toBe(testUser.toString());
        expect(response.body.content).toBe(testComments[0].content);
    });

    it('should return 404 if post not found', async () => {
        const invalidPostIdResponse = await request(app)
            .get(`/comments/post/507f1f77bcf86cd799439011`)
            .set('Authorization', `Bearer ${accessToken}`);
        
        expect(invalidPostIdResponse.status).toBe(404);
        expect(invalidPostIdResponse.body.message).toBe('Post not found');
    });

    it('should get comments for a post', async () => {
        await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is the first comment for post',
                postId: post_id.toString(),
                author: testUser.toString(),
            });

        await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is the second comment for post',
                postId: post_id.toString(),
                author: testUser.toString(),
            });
        
        const getCommentsResponse = await request(app)
        .get(`/comments/post/${post_id.toString()}`)
        .set('Authorization', `Bearer ${accessToken}`);

        expect(getCommentsResponse.status).toBe(200);
        expect(getCommentsResponse.body.length).toBe(4); 
    });

    it('should return 404 when no comments exist for a post', async () => {
        const createPostResponse = await request(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Post with no comments',
                content: 'This is a post with no comments.',
                author: testUser,
            });

        const newPostId = createPostResponse.body.post._id;

        const getCommentsResponse = await request(app)
            .get(`/comments/post/${newPostId.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(getCommentsResponse.status).toBe(404);
        expect(getCommentsResponse.body.message).toBe('No comments found');
    });

    test("Should not create a comment without content", async () => {
        const invalidComment = { ...testComments[0] };
        invalidComment.content = "";
        invalidComment.postId = post_id.toString();
        invalidComment.author = testUser.toString();
    
        const response = await request(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
    
        console.log('body:', response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content is required");
    });

    test("Should not create a comment without authentication", async () => {
        const invalidComment = { ...testComments[0] };
        invalidComment.postId = post_id.toString();
        invalidComment.author = testUser.toString();
        
        const response = await request(app)
            .post("/comments")
            .send(invalidComment);
        
        console.log('body:', response.body);
        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Access denied. No token provided.");
    });

    it('should not create a comment for a non-existing post', async () => {
        const req = {
            body: {
                content: 'Test Comment',
                postId: '1234567890abcdef12345678',
            },
            user: {
                userId: testUser,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await commentsController.createComment(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });

    it('should not update a comment if the user is not the author', async () => {
        const unauthorizedUserResponse = await request(app)
            .post('/users/register')
            .send({
                username: 'unauthorizedUser',
                email: 'unauthorizeduser@example.com',
                password: 'password123',
            });
        expect(unauthorizedUserResponse.status).toBe(201);
    
        const unauthorizedUserLogin = await request(app)
            .post('/users/login')
            .send({
                email: 'unauthorizeduser@example.com',
                password: 'password123',
            });
        
        const unauthorizedUserToken = unauthorizedUserLogin.body.token;  
        
        const updateResponse = await request(app)
            .put(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${unauthorizedUserToken}`)
            .send({ content: 'Updated comment content' });
    
        expect(updateResponse.status).toBe(403);  
        expect(updateResponse.body.message).toBe('Unauthorized');  
    });

    it('should update a comment', async () => {
        const commentResponse = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is a comment to update',
                postId: post_id.toString(),
                author: testUser.toString(),
            });
    
        expect(commentResponse.status).toBe(201);
        const commentToUpdateId = commentResponse.body._id;
    
        const updatedComment = { content: 'Updated content for the comment' };
        const updateResponse = await request(app)
            .put(`/comments/${commentToUpdateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updatedComment);
        
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.content).toBe(updatedComment.content);
    });

    it('should not update a comment with empty content', async () => {
        const commentResponse = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is a comment to update',
                postId: post_id.toString(),
                author: testUser.toString(),
            });
    
        expect(commentResponse.status).toBe(201);
        const commentToUpdateId = commentResponse.body._id;
    
        const updatedComment = { content: '' };
        const updateResponse = await request(app)
            .put(`/comments/${commentToUpdateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updatedComment);
    
        expect(updateResponse.status).toBe(400);
        expect(updateResponse.body.message).toBe('Content is required');
    });

    it('should delete a comment', async () => {
        const commentResponse = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is a comment to delete',
                postId: post_id.toString(),
                author: testUser.toString(),
            });
    
        expect(commentResponse.status).toBe(201);
        const commentToDeleteId = commentResponse.body._id;
    
        const deleteResponse = await request(app)
            .delete(`/comments/${commentToDeleteId}`)
            .set('Authorization', `Bearer ${accessToken}`);
    
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe('Comment deleted');
    
        const checkDeletedResponse = await request(app)
            .get(`/comments/${commentToDeleteId}`)
            .set('Authorization', `Bearer ${accessToken}`);
    
        expect(checkDeletedResponse.status).toBe(404);
    });

    it('should not delete a comment if the user is not the author', async () => {
        const commentResponse = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'This is a comment to not delete',
                postId: post_id.toString(),
                author: testUser.toString(),
            });
    
        expect(commentResponse.status).toBe(201);
        const commentToDeleteId = commentResponse.body._id;
    
        const otherUserResponse = await request(app)
            .post('/users/register')
            .send({
                username: 'otheruser',
                email: 'otheruser@example.com',
                password: 'password123',
            });
        expect(otherUserResponse.status).toBe(201);
    
        const otherUserLoginResponse = await request(app)
            .post('/users/login')
            .send({
                email: 'otheruser@example.com',
                password: 'password123',
            });
        const otherUserToken = otherUserLoginResponse.body.token;
    
        const deleteResponse = await request(app)
            .delete(`/comments/${commentToDeleteId}`)
            .set('Authorization', `Bearer ${otherUserToken}`);
    
        expect(deleteResponse.status).toBe(403);
        expect(deleteResponse.body.message).toBe('Unauthorized');
    });

    it('should not create a comment for a non-existing post', async () => {
        const nonExistingPostId = '507f1f77bcf86cd799439011';
    
        const invalidComment = {
            content: 'This comment should not be created',
            postId: nonExistingPostId,
            author: testUser.toString(),
        };
    
        const response = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
    
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });

    it('should return 400 for an invalid postId', async () => {
        const invalidPostId = '123456';
        const invalidComment = { 
            content: 'This is an invalid postId test comment',
            postId: invalidPostId,
            author: testUser.toString(),
        };

        const response = await request(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid postId");
    });

    test("Should not create a comment without content", async () => {
        const invalidComment = { ...testComments[0] };
        invalidComment.content = "";
        invalidComment.postId = post_id.toString();
        invalidComment.author = testUser.toString();
    
        const response = await request(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
    
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content is required");
    });

    test("Should not create a comment for an invalid postId", async () => {
        const invalidPostId = '123456';
        const invalidComment = { 
            content: 'This is an invalid postId test comment',
            postId: invalidPostId,
            author: testUser.toString(),
        };
    
        const response = await request(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
    
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid postId");
    });

    test("Should not create a comment for a non-existing post", async () => {
        const nonExistingPostId = '507f1f77bcf86cd799439011';
        
        const invalidComment = {
            content: 'This comment should not be created',
            postId: nonExistingPostId,
            author: testUser.toString(),
        };
        
        const response = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });

    test('should return 404 if comment not found', async () => {
        const invalidCommentId = '507f1f77bcf86cd799439011';
    
        const response = await request(app)
            .delete(`/comments/${invalidCommentId}`)
            .set('Authorization', `Bearer ${accessToken}`);
    
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Comment not found');
    });

    test('should return 404 if comment not found when updating', async () => {
        const invalidCommentId = '507f1f77bcf86cd799439011';
    
        const response = await request(app)
            .put(`/comments/${invalidCommentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'Updated comment content',
            });
    
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Comment not found');
    });
});
