const Comment = require('../models/comment'); 
const Post = require('../models/post');
const User = require('../models/user');

// יצירת תגובה חדשה
exports.createComment = async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.userId; // נניח ש-authMiddleware מגדיר userId

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newComment = new Comment({
            content,
            postId,
            author: userId,
        });

        await newComment.save();
        res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
};


exports.addComment = async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.status(200).send(comments);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) return res.status(404).send({ error: 'Comment not found' });
        res.status(200).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) return res.status(404).send({ error: 'Comment not found' });
        res.status(200).send({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
};
