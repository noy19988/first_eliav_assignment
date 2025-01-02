const express = require('express');
const router = express.Router();
const Comment = require('../models/comment'); 
const {
    addComment,
    getCommentsByPost,
    updateComment,
    deleteComment
} = require('../controllers/commentsController'); 
router.post('/', addComment);

router.get('/post/:postId', getCommentsByPost);

router.put('/:id', updateComment);

router.delete('/:id', deleteComment);

module.exports = router;
