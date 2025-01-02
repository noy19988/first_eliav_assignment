const express = require('express'); // ייבוא ספריית Express
const mongoose = require('mongoose'); // ייבוא ספריית Mongoose לחיבור למסד נתונים
const bodyParser = require('body-parser'); // ספרייה לטיפול בבקשות JSON

// יצירת אפליקציית Express
const app = express();
app.use(bodyParser.json()); // Middleware לטיפול בבקשות JSON

// חיבור ל-MongoDB
mongoose.connect('mongodb://localhost:27017/web_class', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
});


mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

// ייבוא ראוטים
const postsRoutes = require('./routes/postsRoutes'); // נתיבים לפוסטים
const commentsRoutes = require('./routes/commentsRoutes'); // נתיבים לתגובות

// רישום הנתיבים
app.use('/post', postsRoutes); // כתובת בסיסית לפוסטים
app.use('/comment', commentsRoutes); // כתובת בסיסית לתגובות

// הפעלת השרת
const PORT = 3000; // הפורט עליו השרת יפעל
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
