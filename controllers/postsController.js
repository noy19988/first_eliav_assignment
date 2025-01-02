const Post = require('../models/post'); 


exports.addPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        console.log('Post saved:', post); 
        res.status(201).send(post); 
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send({ error: 'Post not found' });
        res.status(200).send(post);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) return res.status(404).send({ error: 'Post not found' });
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.getPostsBySender = async (req, res) => {
    try {
        const posts = await Post.find({ sender: req.query.sender });
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error);
    }
};


exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).send({ error: 'Post not found' });
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
