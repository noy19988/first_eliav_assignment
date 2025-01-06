import express, { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware'; // Middleware לאימות
import {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
    getPostsBySender,
    deletePost,
} from '../controllers/postsController';

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
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
 *                 $ref: '#/components/schemas/Post'
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
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getPostById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Add a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
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
router.delete('/:id', authMiddleware, deletePost);

/**
 * @swagger
 * /posts/sender/{sender}:
 *   get:
 *     summary: Get posts by sender
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: sender
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the sender to filter posts
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       404:
 *         description: Posts not found
 *       500:
 *         description: Internal server error
 */
router.get('/sender/:sender', getPostsBySender);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update a post by its ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, updatePost);

export default router;
