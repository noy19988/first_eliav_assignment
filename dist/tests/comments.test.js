"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../src/server")); // שימוש בפונקציה initApp
const user_1 = __importDefault(require("../src/models/user"));
const post_1 = __importDefault(require("../src/models/post"));
const comment_1 = __importDefault(require("../src/models/comment"));
const commentsController = __importStar(require("../src/controllers/commentsController"));
const test_comments_json_1 = __importDefault(require("../tests/test_comments.json"));
const commentsRoutes_1 = __importDefault(require("../src/routes/commentsRoutes"));
var app;
let accessToken;
let testUser;
let testPost;
let commentId = "";
let post_id;
beforeAll(async () => {
    app = await (0, server_1.default)(); // ודא שהאפליקציה עולה כאן
    app.use('/comments', commentsRoutes_1.default);
    // יצירת משתמש
    await user_1.default.deleteMany({});
    await post_1.default.deleteMany({});
    await comment_1.default.deleteMany({});
    const userResponse = await (0, supertest_1.default)(app)
        .post('/users/register')
        .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
    });
    expect(userResponse.status).toBe(201);
    const loginResponse = await (0, supertest_1.default)(app)
        .post('/users/login')
        .send({
        email: 'testuser@example.com',
        password: 'password123',
    });
    accessToken = loginResponse.body.token;
    const user = await user_1.default.findOne({ email: 'testuser@example.com' });
    if (user) {
        testUser = user._id; // שמור את ה-ObjectId של המשתמש
    }
    // יצירת פוסט
    const response = await (0, supertest_1.default)(app)
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
    await mongoose_1.default.connection.close(); // סגירת החיבור למסד נתונים
});
describe('Comments API', () => {
    test("Test Create Comment", async () => {
        test_comments_json_1.default[0].postId = post_id.toString();
        test_comments_json_1.default[0].author = testUser.toString();
        const response = await (0, supertest_1.default)(app).post("/comments").set('Authorization', `Bearer ${accessToken}`).send(test_comments_json_1.default[0]);
        console.log('body', response.body);
        console.log('access token:', accessToken);
        console.log('test comments [0]:', test_comments_json_1.default[0].content);
        expect(response.statusCode).toBe(201);
        commentId = response.body._id;
    });
    // test("Test should not Create Comment when user not found", async () => {
    //     testComments[0].postId = post_id.toString();
    //     // שליחה של ID לא קיים במקום שם המשתמש
    //     testComments[0].author = '677e853d9058a822f0379asd'; // ID לא קיים
    //     // להוסיף את המידלוור שידמה את ה-req.user בצורה תקינה
    //     app.use((req, res, next) => {
    //         req.user = { userId: testComments[0].author };  // עדכון ה-req.user עם ה-ID הלא קיים
    //         next();
    //     });
    //     // שליחה של הבקשה לאחר שמגדירים את ה-req.user
    //     const response = await request(app)
    //         .post("/comments")
    //         .set('Authorization', `Bearer ${accessToken}`)  // וודא שה- accessToken נכון
    //         .send(testComments[0]);
    //     console.log('body', response.body);
    //     console.log('access token:', accessToken);
    //     console.log('test comments [0]:', testComments[0].content);
    //     // מצפים שהשרת יחזיר שגיאה כי לא נמצא משתמש עם ה-ID הזה
    //     expect(response.statusCode).toBe(404);  // 404 במקרה של לא נמצא
    //     expect(response.body.message).toBe('User not found');
    // });
    test("Should create a comment with valid data", async () => {
        test_comments_json_1.default[0].postId = post_id.toString();
        test_comments_json_1.default[0].author = testUser.toString();
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(test_comments_json_1.default[0]);
        console.log('body:', response.body);
        expect(response.statusCode).toBe(201);
        expect(response.body.postId).toBe(post_id.toString());
        expect(response.body.author).toBe(testUser.toString());
        expect(response.body.content).toBe(test_comments_json_1.default[0].content);
    });
    it('should return 404 if post not found', async () => {
        // שלח בקשה לקבלת התגובות לפוסט לא קיים
        const invalidPostIdResponse = await (0, supertest_1.default)(app)
            .get(`/comments/post/507f1f77bcf86cd799439011`) // מזהה פוסט לא קיים
            .set('Authorization', `Bearer ${accessToken}`);
        // ודא שהסטטוס הוא 404
        expect(invalidPostIdResponse.status).toBe(404);
        // ודא שההודעה היא 'Post not found'
        expect(invalidPostIdResponse.body.message).toBe('Post not found');
    });
    it('should get comments for a post', async () => {
        // יצירת תגובות לפוסט
        await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'This is the first comment for post',
            postId: post_id.toString(),
            author: testUser.toString(),
        });
        await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'This is the second comment for post',
            postId: post_id.toString(),
            author: testUser.toString(),
        });
        // בקשה לקבלת התגובות לפוסט
        const getCommentsResponse = await (0, supertest_1.default)(app)
            .get(`/comments/post/${post_id.toString()}`) // שים לב לשינוי כאן
            .set('Authorization', `Bearer ${accessToken}`);
        expect(getCommentsResponse.status).toBe(200); // ודא שהבקשה עברה בהצלחה
        expect(getCommentsResponse.body.length).toBe(4);
    });
    // Test: קבלת תגובות לפוסט שלא קיימות לו תגובות
    it('should return 404 when no comments exist for a post', async () => {
        // יצירת פוסט חדש בלי תגובות
        const createPostResponse = await (0, supertest_1.default)(app)
            .post('/post')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            title: 'Post with no comments',
            content: 'This is a post with no comments.',
            author: testUser,
        });
        const newPostId = createPostResponse.body.post._id;
        // בקשה לקבלת תגובות לפוסט שאין לו תגובות
        const getCommentsResponse = await (0, supertest_1.default)(app)
            .get(`/comments/post/${newPostId.toString()}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(getCommentsResponse.status).toBe(404);
        expect(getCommentsResponse.body.message).toBe('No comments found');
    });
    test("Should not create a comment without content", async () => {
        const invalidComment = Object.assign({}, test_comments_json_1.default[0]);
        invalidComment.content = ""; // תוכן ריק
        invalidComment.postId = post_id.toString();
        invalidComment.author = testUser.toString();
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        console.log('body:', response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content is required");
    });
    test("Should not create a comment without authentication", async () => {
        const invalidComment = Object.assign({}, test_comments_json_1.default[0]);
        invalidComment.postId = post_id.toString();
        invalidComment.author = testUser.toString();
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .send(invalidComment); // לא סופק Authorization header
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
        await commentsController.createComment(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });
    it('should not update a comment if the user is not the author', async () => {
        // יצירת משתמש לא מאושר
        const unauthorizedUserResponse = await (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'unauthorizedUser',
            email: 'unauthorizeduser@example.com',
            password: 'password123',
        });
        expect(unauthorizedUserResponse.status).toBe(201);
        const unauthorizedUserLogin = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'unauthorizeduser@example.com',
            password: 'password123',
        });
        const unauthorizedUserToken = unauthorizedUserLogin.body.token; // טוקן של המשתמש הלא מאושר
        // שלח בקשה לעדכון התגובה עם טוקן של משתמש אחר
        const updateResponse = await (0, supertest_1.default)(app)
            .put(`/comments/${commentId}`)
            .set('Authorization', `Bearer ${unauthorizedUserToken}`) // שליחה עם טוקן של משתמש לא מאושר
            .send({ content: 'Updated comment content' });
        expect(updateResponse.status).toBe(403); // מצפה לשגיאת גישה 403
        expect(updateResponse.body.message).toBe('Unauthorized'); // מצפה להודעת שגיאה תקנית
    });
    it('should update a comment', async () => {
        // יצירת תגובה לפני עדכון
        const commentResponse = await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'This is a comment to update',
            postId: post_id.toString(),
            author: testUser.toString(),
        });
        expect(commentResponse.status).toBe(201); // ודא שהתגובה נוצרה
        const commentToUpdateId = commentResponse.body._id;
        // עדכון התגובה
        const updatedComment = { content: 'Updated content for the comment' };
        const updateResponse = await (0, supertest_1.default)(app)
            .put(`/comments/${commentToUpdateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updatedComment);
        expect(updateResponse.status).toBe(200); // ודא שהעדכון הצליח
        expect(updateResponse.body.content).toBe(updatedComment.content);
    });
    it('should not update a comment with empty content', async () => {
        // יצירת תגובה לפני עדכון
        const commentResponse = await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'This is a comment to update',
            postId: post_id.toString(),
            author: testUser.toString(),
        });
        expect(commentResponse.status).toBe(201); // ודא שהתגובה נוצרה
        const commentToUpdateId = commentResponse.body._id;
        // עדכון התגובה עם תוכן ריק
        const updatedComment = { content: '' }; // תוכן ריק
        const updateResponse = await (0, supertest_1.default)(app)
            .put(`/comments/${commentToUpdateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updatedComment);
        // ודא שהעדכון לא הצליח
        expect(updateResponse.status).toBe(400); // מצפים ל-Bad Request (400)
        expect(updateResponse.body.message).toBe('Content is required'); // ודא שההודעה נכונה
    });
    it('should delete a comment', async () => {
        // יצירת תגובה לפני מחיקתה
        const commentResponse = await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'This is a comment to delete',
            postId: post_id.toString(),
            author: testUser.toString(),
        });
        expect(commentResponse.status).toBe(201); // ודא שהתגובה נוצרה
        const commentToDeleteId = commentResponse.body._id;
        // מחיקת התגובה
        const deleteResponse = await (0, supertest_1.default)(app)
            .delete(`/comments/${commentToDeleteId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(deleteResponse.status).toBe(200); // ודא שהמחיקה הצליחה
        expect(deleteResponse.body.message).toBe('Comment deleted');
        // בדיקה שהתגובה אינה קיימת יותר
        const checkDeletedResponse = await (0, supertest_1.default)(app)
            .get(`/comments/${commentToDeleteId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(checkDeletedResponse.status).toBe(404); // התגובה לא נמצאה
    });
    it('should not delete a comment if the user is not the author', async () => {
        // יצירת תגובה על ידי המשתמש הראשי (testUser)
        const commentResponse = await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            content: 'This is a comment to not delete',
            postId: post_id.toString(),
            author: testUser.toString(),
        });
        expect(commentResponse.status).toBe(201); // ודא שהתגובה נוצרה
        const commentToDeleteId = commentResponse.body._id;
        // יצירת משתמש נוסף שמנסה למחוק את התגובה
        const otherUserResponse = await (0, supertest_1.default)(app)
            .post('/users/register')
            .send({
            username: 'otheruser',
            email: 'otheruser@example.com',
            password: 'password123',
        });
        expect(otherUserResponse.status).toBe(201);
        const otherUserLoginResponse = await (0, supertest_1.default)(app)
            .post('/users/login')
            .send({
            email: 'otheruser@example.com',
            password: 'password123',
        });
        const otherUserToken = otherUserLoginResponse.body.token;
        // נסיון למחוק את התגובה על ידי משתמש אחר
        const deleteResponse = await (0, supertest_1.default)(app)
            .delete(`/comments/${commentToDeleteId}`)
            .set('Authorization', `Bearer ${otherUserToken}`);
        // מצפים לשגיאת גישה 403
        expect(deleteResponse.status).toBe(403);
        expect(deleteResponse.body.message).toBe('Unauthorized');
    });
    it('should not create a comment for a non-existing post', async () => {
        const nonExistingPostId = '507f1f77bcf86cd799439011'; // מזהה פוסט לא קיים (כמובן לא קיים במסד הנתונים)
        const invalidComment = {
            content: 'This comment should not be created',
            postId: nonExistingPostId,
            author: testUser.toString(),
        };
        const response = await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        expect(response.statusCode).toBe(404); // מצפים לשגיאת 404
        expect(response.body.message).toBe('Post not found'); // מצפים להודעת שגיאה מתאימה
    });
    it('should return 400 for an invalid postId', async () => {
        const invalidPostId = '123456'; // לא ID תקני של MongoDB
        const invalidComment = {
            content: 'This is an invalid postId test comment',
            postId: invalidPostId,
            author: testUser.toString(),
        };
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid postId");
    });
    test("Should not create a comment without content", async () => {
        const invalidComment = Object.assign({}, test_comments_json_1.default[0]);
        invalidComment.content = ""; // תוכן ריק
        invalidComment.postId = post_id.toString();
        invalidComment.author = testUser.toString();
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Content is required");
    });
    test("Should not create a comment for an invalid postId", async () => {
        const invalidPostId = '123456'; // לא ID תקני של MongoDB
        const invalidComment = {
            content: 'This is an invalid postId test comment',
            postId: invalidPostId,
            author: testUser.toString(),
        };
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid postId");
    });
    test("Should not create a comment for a non-existing post", async () => {
        const nonExistingPostId = '507f1f77bcf86cd799439011'; // מזהה פוסט לא קיים (כמובן לא קיים במסד הנתונים)
        const invalidComment = {
            content: 'This comment should not be created',
            postId: nonExistingPostId,
            author: testUser.toString(),
        };
        const response = await (0, supertest_1.default)(app)
            .post('/comments')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidComment);
        expect(response.statusCode).toBe(404); // מצפים לשגיאת 404
        expect(response.body.message).toBe('Post not found'); // מצפים להודעת שגיאה מתאימה
    });
    // it('should not update a comment if the comment does not exist', async () => {
    //     const nonExistingCommentId = '507f1f77bcf86cd799439011';  // מזהה תגובה לא קיים
    //     const response = await request(app)
    //         .put(`/comments/${nonExistingCommentId}`)
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .send({ content: 'Updated comment content' });
    //     expect(response.statusCode).toBe(404);  // מצפים לשגיאת 404
    //     expect(response.body.message).toBe('Comment not found');  // מצפים להודעת שגיאה מתאימה
    // });
    // it('should not update a comment if the user is not the author', async () => {
    //     // יצירת משתמש לא מאושר
    //     const unauthorizedUserResponse = await request(app)
    //         .post('/users/register')
    //         .send({
    //             username: 'unauthorizedUser',
    //             email: 'unauthorizeduser@example.com',
    //             password: 'password123',
    //         });
    //     expect(unauthorizedUserResponse.status).toBe(201);
    //     const unauthorizedUserLogin = await request(app)
    //         .post('/users/login')
    //         .send({
    //             email: 'unauthorizeduser@example.com',
    //             password: 'password123',
    //         });
    //     const unauthorizedUserToken = unauthorizedUserLogin.body.token;  // טוקן של המשתמש הלא מאושר
    //     // שלח בקשה לעדכון התגובה עם טוקן של משתמש אחר
    //     const updateResponse = await request(app)
    //         .put(`/comments/${commentId}`)
    //         .set('Authorization', `Bearer ${unauthorizedUserToken}`) // שליחה עם טוקן של משתמש לא מאושר
    //         .send({ content: 'Updated comment content' });
    //     expect(updateResponse.status).toBe(403);  // מצפה לשגיאת גישה 403
    //     expect(updateResponse.body.message).toBe('Unauthorized');  // מצפה להודעת שגיאה תקנית
    // });
    // it('should not delete a comment if the user is not the author', async () => {
    //     // יצירת תגובה על ידי המשתמש הראשי (testUser)
    //     const commentResponse = await request(app)
    //         .post('/comments')
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .send({
    //             content: 'This is a comment to not delete',
    //             postId: post_id.toString(),
    //             author: testUser.toString(),
    //         });
    //     expect(commentResponse.status).toBe(201); // ודא שהתגובה נוצרה
    //     const commentToDeleteId = commentResponse.body._id;
    //     // יצירת משתמש נוסף שמנסה למחוק את התגובה
    //     const otherUserResponse = await request(app)
    //         .post('/users/register')
    //         .send({
    //             username: 'otheruser',
    //             email: 'otheruser@example.com',
    //             password: 'password123',
    //         });
    //     expect(otherUserResponse.status).toBe(201);
    //     const otherUserLoginResponse = await request(app)
    //         .post('/users/login')
    //         .send({
    //             email: 'otheruser@example.com',
    //             password: 'password123',
    //         });
    //     const otherUserToken = otherUserLoginResponse.body.token;
    //     // נסיון למחוק את התגובה על ידי משתמש אחר
    //     const deleteResponse = await request(app)
    //         .delete(`/comments/${commentToDeleteId}`)
    //         .set('Authorization', `Bearer ${otherUserToken}`);
    //     expect(deleteResponse.status).toBe(403);  // מצפים לשגיאת גישה 403
    //     expect(deleteResponse.body.message).toBe('Unauthorized');  // מצפים להודעת שגיאה מתאימה
    // });
    test("Should return 400 if postId is invalid when creating comment", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId: "invalidPostId", content: "Valid content" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid postId");
    });
    test("Should return 400 if content is empty when creating comment", async () => {
        const response = await (0, supertest_1.default)(app)
            .post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId: post_id, content: "" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Content is required");
    });
});
