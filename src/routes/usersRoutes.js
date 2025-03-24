"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var usersController_1 = require("../controllers/usersController");
var multer_1 = require("multer");
var path_1 = require("path");
var router = express_1.default.Router();
// ✅ 1. הגדרת `multer` לאחסון תמונות בתיקיית `public/uploads`
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var uploadPath = path_1.default.join(process.cwd(), "public/uploads/");
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix);
    },
});
// ✅ 2. פילטר לבדוק שהקובץ הוא תמונה
var fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed!"), false);
    }
};
var upload = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter });
router.put("/:id", upload.single("profileImage"), usersController_1.default.updateUser);
router.get("/:id", usersController_1.default.getUserDetails);
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - username
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         username: 'bob'
 *         email: 'bob@gmail.com'
 *         password: '123456'
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Registration successful, returns the new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/register', usersController_1.default.registerUser);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and return access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 _id:
 *                   type: string
 *                   description: User ID
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post('/login', usersController_1.default.loginUser);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 *       500:
 *         description: Internal server error
 */
router.post('/logout', usersController_1.default.logoutUser);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh the user's access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', usersController_1.default.refreshToken);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *               imgUrl:
 *                 type: string
 *                 description: The URL of the user's profile image (optional)
 *             example:
 *               username: 'bob'
 *               email: 'bob@gmail.com'
 *               password: 'newpassword'
 *               imgUrl: 'https://example.com/new-image.png'
 *     responses:
 *       200:
 *         description: Updated user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user data
 *       404:
 *         description: User not found
 */
router.put('/:id', usersController_1.default.updateUser);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', usersController_1.default.deleteUser);
/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Authenticate a user using Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 userId:
 *                   type: string
 *                   description: User ID
 *       400:
 *         description: Invalid Google token
 *       500:
 *         description: Internal server error
 */
router.post('/google-login', usersController_1.default.googleLogin);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Updated user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user data
 *       404:
 *         description: User not found
 */
router.put("/:id", upload.single("profileImage"), usersController_1.default.updateUser);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 imgUrl:
 *                   type: string
 *                   description: URL of the user's profile image
 *       404:
 *         description: User not found
 */
router.get('/:id', usersController_1.default.getUserDetails); // Get user details by ID
exports.default = router;
