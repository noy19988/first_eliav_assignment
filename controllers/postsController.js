const Post = require('../models/post'); // ייבוא המודל לפוסטים

// הוספת פוסט חדש
exports.addPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        console.log('Post saved:', post); // הדפסה לקונסול
        res.status(201).send(post); // מחזיר את הפוסט שנשמר, כולל ה-ID
    } catch (error) {
        res.status(400).send(error);
    }
};

// קבלת כל הפוסטים
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
};

// קבלת פוסט לפי ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send({ error: 'Post not found' });
        res.status(200).send(post);
    } catch (error) {
        res.status(500).send(error);
    }
};

// עדכון פוסט
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) return res.status(404).send({ error: 'Post not found' });
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

// חיפוש פוסטים לפי שולח
exports.getPostsBySender = async (req, res) => {
    try {
        const posts = await Post.find({ sender: req.query.sender });
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
};

// מחיקת פוסט
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).send({ error: 'Post not found' });
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
