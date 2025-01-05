require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// הגדרת האפליקציה
const app = express();

// Middleware
app.use(bodyParser.json());

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);

// Routes
const usersRoutes = require('./routes/usersRoutes');
const postsRoutes = require('./routes/postsRoutes');
const commentsRoutes = require('./routes/commentsRoutes');

app.use('/users', usersRoutes);
app.use('/post', postsRoutes);
app.use('/comment', commentsRoutes);

// חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rest-api')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// הגדרת השרת
const PORT = process.env.PORT || 3000;

// יצוא של app ללא התחלת השרת
module.exports = app;

// הפעלת השרת רק אם לא מבוצע ייבוא של הקובץ
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
