const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Middleware לאימות
const {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
    getPostsBySender,
    deletePost
} = require('../controllers/postsController');



/**
* @swagger
* tags:
*   name: Auth
*   description: The Posts API
*/


/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - owner
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *           example: "My First Post"
 *         content:
 *           type: string
 *           description: The content of the post
 *           example: "This is the content of my first post."
 *         owner:
 *           type: string
 *           description: The user ID of the post owner
 *           example: "60f3b4b3b3b3b3b3b3b3b3b3"
 *         _id:
 *           type: string
 *           description: The unique ID of the post
 *           example: "60f3b4b3b3b3b3b3b3b3b3b3"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the post was created
 *           example: "2025-01-05T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the post was last updated
 *           example: "2025-01-06T12:00:00.000Z"
 */


/**
* @swagger
* /posts:
*   get:
*     summary: Get all posts
*     description: Retrieve all posts
*     tags: [Posts]
*     responses:
*       200:
*         description: Posts retrieved successfully
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   title:
*                     type: string
*                   content:
*                     type: string
*                   owner:
*                     type: string
*                   _id:
*                     type: string
*       500:
*         description: Internal server error
*/
router.get('/', getAllPosts);



/**
* @swagger
* /posts/{id}:
*   get:
*     summary: Get a post by ID
*     description: Retrieve a post by its ID
*     tags: [Posts]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The ID of the post to retrieve
*     responses:
*       200:
*         description: Post retrieved successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 title:
*                   type: string
*                 content:
*                   type: string
*                 owner:
*                   type: string
*                 _id:
*                   type: string
*       404:
*         description: Post not found
*       500:
*         description: Internal server error
*/
// קריאה לפוסט לפי ID
router.get('/:id', getPostById);




/**
* @swagger
* /posts:
*   post:
*     summary: add a new post
*     tags: [Posts]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*               type: object
*               properties:
*                       title:
*                           type: string
*                           description: the post title
*                           example: "My first post"
*                       content:
*                           type: string
*                           description: the post content
*                           example: "This is my first post ....."
*     responses:
*       200:
*         description: The post was successfully created
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                       title:
*                           type: string
*                           description: the post title
*                           example: "My first post"
*                       content:
*                           type: string
*                           description: the post content
*                           example: "This is my first post ....."
*                       owner:
*                           type: string
*                           description: the post owner
*                           example: "60f3b4b3b3b3b3b3b3b3b3b3"
*                       _id:
*                           type: string
*                           description: the post id
*                           example: "60f3b4b3b3b3b3b3b3b3b3"
*/
// יצירת פוסט חדש (דורש אימות)
router.post('/', authMiddleware, addPost);



/**
* @swagger
* /posts/{id}:
*   delete:
*     summary: Delete a post
*     description: Delete a post by its ID
*     security:
*       - bearerAuth: []
*     tags: [Posts]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The ID of the post to delete
*     responses:
*       200:
*         description: Post deleted successfully
*       404:
*         description: Post not found
*       500:
*         description: Internal server error
*/
// מחיקת פוסט (דורש אימות)
router.delete('/:id', authMiddleware, deletePost);

// קריאה לפוסטים לפי sender
router.get('/sender/:sender', getPostsBySender);

// עדכון פוסט (דורש אימות)
router.put('/:id', authMiddleware, updatePost);



module.exports = router;
