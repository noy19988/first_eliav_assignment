const Comment = require('../models/comment'); // ייבוא המודל לתגובות


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
