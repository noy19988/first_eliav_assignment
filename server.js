// Noy Amsalem - 207277823


const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json()); 


mongoose.connect('mongodb://localhost:27017/rest-api', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err.message);
});


const postsRoutes = require('./routes/postsRoutes'); 
const commentsRoutes = require('./routes/commentsRoutes'); 


app.use('/post', postsRoutes); 
app.use('/comment', commentsRoutes); 

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
