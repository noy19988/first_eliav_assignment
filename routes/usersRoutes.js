const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware לאימות

// רישום משתמש חדש
router.post('/register', usersController.registerUser);

// התחברות משתמש
router.post('/login', usersController.loginUser);

// התנתקות משתמש
router.post('/logout', usersController.logoutUser);

// רענון טוקן
router.post('/refresh', usersController.refreshToken); // אינו דורש אימות כי ה-refresh token מספק את האימות

// קריאה לכל המשתמשים
router.get('/', authMiddleware, usersController.getAllUsers);

// קריאה למשתמש לפי ID
router.get('/:id', authMiddleware, usersController.getUserById);

// עדכון פרטי משתמש
router.put('/:id', authMiddleware, usersController.updateUser);

// מחיקת משתמש
router.delete('/:id', authMiddleware, usersController.deleteUser);

module.exports = router;
