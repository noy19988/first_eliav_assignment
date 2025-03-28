import dotenv from 'dotenv';
import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import * as usersController from '../src/controllers/usersController'; 
import userModel, { IUser } from "../src/models/user";
import postModel from "../src/models/post";
import { Console } from 'console';
import fs from 'fs';
import path from 'path';

dotenv.config();

let accessToken: string;
let userId: string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';


beforeAll(async () => {
    console.log('beforeAll');
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
    console.log('Login response body:', loginResponse.body); 

    console.log('userId after login:', userId); 

});

afterAll(async () => {
    console.log("afterAll");
    await mongoose.connection.close();
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
                username: '', 
                email: 'missingfield@example.com',
                password: 'password123',
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required');
    });



    test('should fail to refresh token with invalid refresh token or user', async () => {
        const invalidRefreshToken = 'invalidRefreshToken';
    
        const response = await request(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
    
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
                password: 'wrongpassword', 
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Wrong password');
    });
    

    test('should fail to register a user with an existing email', async () => {
        const response = await request(app)
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


    test('should handle error when deleting old image fails', async () => {
        const imagePath = path.join(__dirname, 'test-image.png');

        if (!fs.existsSync(imagePath)) {
            throw new Error(`Test image not found at ${imagePath}`);
        }

        const mockRenameSync = jest.spyOn(fs, 'renameSync');
        mockRenameSync.mockImplementationOnce(() => {
        });

        const mockUnlinkSync = jest.spyOn(fs, 'unlinkSync');
        mockUnlinkSync.mockImplementationOnce(() => {
            throw new Error('Failed to delete old image');
        });

        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .attach('profileImage', imagePath);
        expect(response.status).toBe(200);

        mockRenameSync.mockRestore();
        mockUnlinkSync.mockRestore();
    });

    test('should get user details successfully', async () => {
        console.log("Testing getting user details for ID:", userId);
        const response = await request(app)
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
        
        const response = await request(app)
            .get(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${accessToken}`);  
        console.log("Response status:", response.status); 
        console.log("Response body:", response.body); 
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found'); 
    });



    it('should fail logout when no refresh token is provided', async () => {
        const response = await request(app)
            .post('/users/logout')
            .send({});
        expect(response.status).toBe(400); 
        expect(response.body.message).toBe('Refresh token is required');
    });



    test('should fail to logout with invalid refresh token', async () => {
        const invalidRefreshToken = 'invalidRefreshToken'; 
    
        const response = await request(app)
            .post('/users/logout') 
            .send({ refreshToken: invalidRefreshToken }) 
            .set('Authorization', `Bearer ${accessToken}`); 
    
        expect(response.status).toBe(404); 
        expect(response.body.message).toBe('Invalid refresh token');
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
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: "newuser@example.com",
                password: "password123"
            });
    
        const refreshToken = loginResponse.body.refreshToken;
    
   
        const logoutResponse = await request(app)
            .post('/users/logout')
            .send({ refreshToken }) 
            .set('Authorization', `Bearer ${refreshToken}`); 
    
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

    test('should update username successfully', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: 'updatedUser'
            });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('updatedUser');
        expect(response.body.email).toBe('newuser@example.com');
    });
    
    test('should allow updating user with empty profile image field', async () => {
        const originalResponse = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
    
        const originalImgUrl = originalResponse.body.imgUrl;
    
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                username: 'validUsername', 
            });
    
        expect(response.status).toBe(200);
        expect(response.body.imgUrl).toBe(originalImgUrl); 
    });
    


    test('should update user profile image successfully', async () => {
    const imagePath = path.join(__dirname, 'test-image.png');

    if (!fs.existsSync(imagePath)) {
        throw new Error(`Test image not found at ${imagePath}`);
    }

    const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('profileImage', imagePath);

    expect(response.status).toBe(200);
    expect(response.body.imgUrl).toBeDefined();
    expect(response.body.imgUrl).toContain('/uploads/');

    const imageUrl = response.body.imgUrl;
    const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1); 
    const savedImagePath = path.join('public', 'uploads', imageName);
    expect(fs.existsSync(savedImagePath)).toBe(true);

    fs.unlinkSync(savedImagePath);
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
        const invalidUserId = '677d9b8cc48f35c1eb52d444';  
    
        const response = await request(app)
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
        
        const response = await request(app)
            .post('/users/refresh')
            .send({ refreshToken: invalidRefreshToken });
        
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid refresh token');
    });



    test('should fail to refresh token when no refresh token is provided', async () => {
        const response = await request(app)
            .post('/users/refresh')
            .send({});
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Refresh token is required');
    });

    test('should fail googleLogin with no token provided', async () => {
        const response = await request(app)
            .post('/users/google-login')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No Google token provided');
    });

    test('should fail googleLogin with invalid google token', async () => {
        const response = await request(app)
            .post('/users/google-login')
            .send({ token: 'invalidGoogleToken' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Google token');
    });

    test('should update user with no data provided', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No data provided for update');
    });

 

    test('should fail getUserDetails if an error occurs', async () => {
        jest.spyOn(userModel, 'findById').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving user details');

        jest.spyOn(userModel, 'findById').mockRestore();
    });

    test('should handle registration error', async () => {
        jest.spyOn(userModel.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Registration error');
        });

        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'errorUser',
                email: 'error@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error registering user');

        jest.spyOn(userModel.prototype, 'save').mockRestore();
    });

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

    test('should handle login error', async () => {
        jest.spyOn(userModel, 'findOne').mockImplementationOnce(() => {
            throw new Error('Login error');
        });

        const response = await request(app)
            .post('/users/login')
            .send({ email: 'error@example.com', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging in');

        jest.spyOn(userModel, 'findOne').mockRestore();
    });



    test('should fail googleLogin with invalid google token', async () => {
        const response = await request(app)
            .post('/users/google-login')
            .send({ token: 'invalidGoogleToken' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Google token');
    });

    test('should update user with no data provided', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No data provided for update');
    });

    test('should fail getUserDetails if an error occurs', async () => {
        const findByIdMock = jest.spyOn(userModel, 'findById');
        findByIdMock.mockImplementationOnce(() => {
            throw new Error('Test Error');
        });

        const response = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving user details');

        findByIdMock.mockRestore(); 
    });

    test('should handle registration error', async () => {
        jest.spyOn(userModel.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Registration error');
        });

        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'errorUser',
                email: 'error@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error registering user');

        jest.spyOn(userModel.prototype, 'save').mockRestore();
    });

    test('should handle login error', async () => {
        jest.spyOn(userModel, 'findOne').mockImplementationOnce(() => {
            throw new Error('Login error');
        });

        const response = await request(app)
            .post('/users/login')
            .send({ email: 'error@example.com', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging in');

        jest.spyOn(userModel, 'findOne').mockRestore();
    });


    

    test('should delete a user successfully', async () => {
        console.log("Deleting user with ID AT TEST:", userId);
    
        const response = await request(app)
            .delete(`/users/${userId}`)  
            .set('Authorization', `Bearer ${accessToken}`);  
        console.log("the token is:", accessToken);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });




    test('should fail googleLogin with invalid google token', async () => {
        const response = await request(app)
            .post('/users/google-login')
            .send({ token: 'invalidGoogleToken' });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid Google token');
    });

    test('should update user with no data provided', async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No data provided for update');
    });

    test('should fail getUserDetails if an error occurs', async () => {
        jest.spyOn(userModel, 'findById').mockImplementationOnce(() => {
            throw new Error('Test Error');
        });

        const response = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving user details');

        jest.spyOn(userModel, 'findById').mockRestore();
    });


    test('should handle registration error', async () => {
        jest.spyOn(userModel.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Registration error');
        });

        const response = await request(app)
            .post('/users/register')
            .send({
                username: 'errorUser',
                email: 'error@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error registering user');

        jest.spyOn(userModel.prototype, 'save').mockRestore();
    });

    test('should handle login error', async () => {
        jest.spyOn(userModel, 'findOne').mockImplementationOnce(() => {
            throw new Error('Login error');
        });

        const response = await request(app)
            .post('/users/login')
            .send({ email: 'error@example.com', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging in');

        jest.spyOn(userModel, 'findOne').mockRestore();
    });

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

    test('should handle logout error', async () => {
        jest.spyOn(userModel, 'findOne').mockImplementationOnce(() => {
            throw new Error('Logout error');
        });

        const response = await request(app)
            .post('/users/logout')
            .send({ refreshToken: 'refreshToken' })
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error logging out');

        jest.spyOn(userModel, 'findOne').mockRestore();
    });

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

    test('should handle updateUser error', async () => {
        jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(() => {
            throw new Error('Update user error');
        });

        const response = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'updatedUsername' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error updating user');

        jest.spyOn(userModel, 'findByIdAndUpdate').mockRestore();
    });

    test('should handle deleteUser error', async () => {
        jest.spyOn(userModel, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error('Delete user error');
        });

        const response = await request(app)
            .delete(`/users/${userId}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error deleting user');

        jest.spyOn(userModel, 'findByIdAndDelete').mockRestore();
    });


    
    
});



