"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const postsController_1 = require("../controllers/postsController");
const router = express_1.default.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         author:
 *           type: string
 *           description: The ID of the user who created the post
 *       example:
 *         title: 'Sample Post'
 *         content: 'This is a sample content for the post.'
 *         author: '60b8d58f7c6b2d001c8b2d22'
 */
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */
// /**
//  * @swagger
//  * /posts:
//  *   get:
//  *     summary: Get all posts
//  *     description: Retrieve all posts
//  *     tags: [Posts]
//  *     responses:
//  *       200:
//  *         description: Posts retrieved successfully
//  *       500:
//  *         description: Internal server error
//  */
// router.get("/", getAllPosts);
// /**
//  * @swagger
//  * /posts/{id}:
//  *   get:
//  *     summary: Get a post by ID
//  *     description: Retrieve a post by its ID
//  *     tags: [Posts]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The ID of the post to retrieve
//  *     responses:
//  *       200:
//  *         description: Post retrieved successfully
//  *       404:
//  *         description: Post not found
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/:id', getPostById);
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: create a new post
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
 */
router.post('/', authMiddleware_1.default, postsController_1.createPost);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.delete('/:id', authMiddleware_1.default, postsController_1.deletePost);
// /**
//  * @swagger
//  * /posts/sender/{sender}:
//  *   get:
//  *     summary: Get posts by sender
//  *     tags: [Posts]
//  *     parameters:
//  *       - in: path
//  *         name: sender
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: The ID of the sender to filter posts
//  *     responses:
//  *       200:
//  *         description: Posts retrieved successfully
//  *       404:
//  *         description: Posts not found
//  *       500:
//  *         description: Internal server error
//  */
// router.get('/sender/:sender', getPostsBySender);
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
router.put('/:id', authMiddleware_1.default, postsController_1.updatePost);
exports.default = router;
