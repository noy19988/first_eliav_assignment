"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_1 = require("multer");
var path_1 = require("path");
var authMiddleware_1 = require("../middleware/authMiddleware");
var generateNutritionController_1 = require("../controllers/generateNutritionController"); // 📌 ייבוא הפונקציה
var postsController_1 = require("../controllers/postsController");
var router = express_1.default.Router();
// 📌 הגדרת אחסון קבצים
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
var upload = (0, multer_1.default)({ storage: storage });
// ✅ יצירת פוסט (כולל העלאת תמונה)
router.post("/", authMiddleware_1.default, upload.single("image"), postsController_1.createPost);
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - recipeTitle
 *         - category
 *         - difficulty
 *         - prepTime
 *         - ingredients
 *         - instructions
 *         - authorId
 *       properties:
 *         recipeTitle:
 *           type: string
 *           description: The title of the recipe post
 *         category:
 *           type: array
 *           items:
 *             type: string
 *           description: Categories for the post
 *         imageUrl:
 *           type: string
 *           description: URL of the recipe image
 *         difficulty:
 *           type: string
 *           enum: ["easy", "medium", "hard"]
 *           description: Difficulty level of the recipe
 *         prepTime:
 *           type: number
 *           description: Preparation time in minutes
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: List of ingredients
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           description: Cooking instructions
 *         authorId:
 *           type: string
 *           description: ID of the user who created the post
 *         likes:
 *           type: number
 *           description: Number of likes the post has
 *         likedBy:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who liked the post
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *           description: List of comment IDs related to the post
 *         savedBy:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who saved the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the post was created
 *       example:
 *         recipeTitle: 'Spaghetti Bolognese'
 *         category: ['Italian', 'Pasta']
 *         imageUrl: 'http://example.com/image.jpg'
 *         difficulty: 'medium'
 *         prepTime: 45
 *         ingredients: ['spaghetti', 'ground beef', 'tomato sauce']
 *         instructions: ['Boil spaghetti', 'Cook beef', 'Mix together']
 *         authorId: '60b8d58f7c6b2d001c8b2d22'
 *         likes: 0
 *         likedBy: []
 *         comments: []
 *         savedBy: []
 *         createdAt: '2025-03-10T12:00:00Z'
 */
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
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
router.post('/', authMiddleware_1.default, upload.single("image"), postsController_1.createPost);
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
 *   put:
 *     summary: Update an existing post
 *     description: Update a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The post was successfully updated
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authMiddleware_1.default, upload.single("image"), postsController_1.updatePost);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by its ID
 *     description: Delete a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authMiddleware_1.default, postsController_1.deletePost);
/**
 * @swagger
 * /posts/{id}/save:
 *   put:
 *     summary: Save a post
 *     description: Save or unsave a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to save or unsave
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post saved or unsaved successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id/save", authMiddleware_1.default, postsController_1.savePost);
/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get all posts by a user
 *     description: Retrieve all posts created by a user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to get posts for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       404:
 *         description: User not found or no posts available
 *       500:
 *         description: Internal server error
 */
router.get("/user/:userId", postsController_1.getPostsByUser);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve all posts with optional filters for search, difficulty, and category
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Keyword to search within the post's title, ingredients, or instructions
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         description: Difficulty level of the recipe (easy, medium, hard)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *       - in: query
 *         name: category
 *         description: Comma-separated list of categories to filter the posts by
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/", postsController_1.getAllPosts);
/**
 * @swagger
 * /posts/{id}/nutrition:
 *   get:
 *     summary: Get nutritional information for a post
 *     description: Retrieve nutritional values for a recipe post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to retrieve nutritional information
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nutritional information retrieved successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/nutrition", generateNutritionController_1.getPostNutrition);
router.get("/search", postsController_1.searchAndFilterPosts);
exports.default = router;
