const express = require('express');
const router = express.Router();
const Post = require('../models/post'); // ייבוא המודל לפוסטים
const postController = require('../controllers/postsController'); // ייבוא ה-Controller של הפוסטים


const {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
    getPostsBySender,
    deletePost 
} = require('../controllers/postsController');

router.post('/', addPost);

router.get('/', getAllPosts);

router.get('/:id', getPostById);

router.put('/:id', updatePost);

router.get("/", postController.getPostsBySender);  



router.delete('/:id', deletePost); 

module.exports = router;
