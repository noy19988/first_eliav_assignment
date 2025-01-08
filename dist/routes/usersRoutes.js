"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = __importDefault(require("../controllers/usersController")); // ייבוא המודול שמכיל את פונקציות השליטה של המשתמשים
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware")); // Middleware לאימות
const router = express_1.default.Router();
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
 *       bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
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
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *       example:
 *         email: 'bob@gmail.com'
 *         password: '123456'
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Registration success, return the new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *               schema:
 *                   type: object
 *                   properties:
 *                       accessToken:
 *                           type: string
 *                           description: JWT access token
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken:
 *                           type: string
 *                           description: JWT refresh token
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       _id:
 *                           type: string
 *                           description: User ID
 *                           example: "60d0fe4f5311236168a109ca"
 *       '400':
 *         description: Invalid email or password
 *       '500':
 *         description: Internal server error
 */
router.post('/login', usersController_1.default.loginUser);
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 */
router.post('/logout', usersController_1.default.logoutUser);
// רישום משתמש חדש
router.post('/register', usersController_1.default.registerUser);
// התחברות משתמש
router.post('/login', usersController_1.default.loginUser);
// רענון טוקן
router.post('/refresh', usersController_1.default.refreshToken); // אינו דורש אימות כי ה-refresh token מספק את האימות
// קריאה לכל המשתמשים
router.get('/', authMiddleware_1.default, usersController_1.default.getAllUsers);
// קריאה למשתמש לפי ID
router.get('/:id', authMiddleware_1.default, usersController_1.default.getUserById);
// עדכון פרטי משתמש
router.put('/:id', authMiddleware_1.default, usersController_1.default.updateUser);
// מחיקת משתמש
router.delete('/:id', authMiddleware_1.default, usersController_1.default.deleteUser);
exports.default = router;
