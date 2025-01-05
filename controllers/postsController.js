const Post = require('../models/post'); 
const User = require('../models/user');

// יצירת פוסט חדש
exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.userId; // נניח ש-authMiddleware מגדיר userId

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPost = new Post({
            title,
            content,
            author: userId,
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error });
    }
};



exports.addPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};


exports.getAllPosts = async (req, res) => {
    try {
        const { sender } = req.query;  

        
        if (sender) {
            const posts = await Post.find({ sender: sender });
            if (posts.length === 0) {
                return res.status(404).send({ message: `No posts found for sender: ${sender}` });
            }
            return res.status(200).send(posts);  
        }

       
        const posts = await Post.find();
        res.status(200).send(posts); 
    } catch (error) {
        res.status(500).send({ error: error.message });  
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
    const sender = req.query.sender;
    console.log('Sender received:', sender); 

    try {
        console.log('yala ya beitar');

        if (!sender) {
            return res.status(400).send({ message: 'Sender query parameter is required' });
        }

        const posts = await Post.find({ sender: sender });
        console.log('Posts found:', posts); 

        if (posts.length === 0) {
            return res.status(404).send({ message: `No posts found for sender: ${sender}` });
        }

        return res.status(200).send(posts);
    } catch (error) {
        console.log('Error:', error); 
        res.status(500).send({ error: error.message });
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
