const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware לאימות



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
router.post('/register', usersController.registerUser);

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
router.post('/login', usersController.loginUser);



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
// התנתקות משתמש
router.post('/logout', usersController.logoutUser);




// רישום משתמש חדש
router.post('/register', usersController.registerUser);

// התחברות משתמש
router.post('/login', usersController.loginUser);

// רענון טוקן
router.post('/refresh', usersController.refreshToken); // אינו דורש אימות כי ה-refresh token מספק את האימות

// קריאה לכל המשתמשים
router.get('/', authMiddleware, usersController.getAllUsers);

// קריאה למשתמש לפי ID
router.get('/:id', authMiddleware, usersController.getUserById);

// עדכון פרטי משתמש
router.put('/:id', authMiddleware, usersController.updateUser);

// מחיקת משתמש
router.delete('/:id', authMiddleware, usersController.deleteUser);

module.exports = router;
