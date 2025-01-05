require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        console.log('Starting user registration...');
        console.log('Password before hashing:', password);

        // בדיקה אם המשתמש כבר קיים
        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (existingUser) {
            console.log('User already exists:', existingUser);
            return res.status(400).json({ message: 'User already exists' });
        }

        
        // יצירת Hash לסיסמה
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Hashed password:', hashedPassword);

        // יצירת משתמש חדש ושמירה ב-DB
        const newUser = new User({ 
            username, 
            email: email, 
            password: hashedPassword,
        });
        await newUser.save();

        console.log('New user created:', newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
};






const generateTokens = (userId) => {
    console.log('Generating tokens for userId:', userId);
    console.log('JWT_SECRET used:', process.env.JWT_SECRET);
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    console.log('Generated token:', token);
    console.log('Generated refreshToken:', refreshToken);
    return { token, refreshToken };
};


//user login
// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt for email:', email);

        const user = await User.findOne({ email: email.toLowerCase() });
        console.log('User from DB:', user);

        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Password from request:', password);
        console.log('Hashed password from DB:', user.password);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password matches:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Invalid password for email:', email);
            return res.status(400).json({ message: 'Wrong password' });
        }

        // יצירת הטוקנים
        const { token, refreshToken } = generateTokens(user._id);
        console.log('Generated tokens:', { token, refreshToken });

        // הוספת ה-refreshToken למשתמש ושמירתו
        user.refreshTokens.push(refreshToken);
        console.log('Updated refreshTokens for user:', user.refreshTokens);
        await user.save();

        console.log('Tokens saved to user:', { token, refreshToken });

        // החזרת תגובה ללקוח
        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            refreshToken 
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};










// User logout
exports.logoutUser = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        console.log('Received refreshToken for logout:', refreshToken);

        // חיפוש משתמש על פי refreshToken
        const user = await User.findOne({ refreshTokens: refreshToken });
        console.log('User found for refreshToken:', user);

        if (!user) {
            console.log('No user found for provided refreshToken:', refreshToken);
            return res.status(404).json({ message: 'Invalid refresh token' });
        }

        // הסרת ה-refreshToken
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        console.log('Updated refreshTokens for user:', user.refreshTokens);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Error logging out', error });
    }
};




exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        if (!refreshToken) {
            console.log('No refresh token provided');
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                console.log('Invalid refresh token:', err);
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            console.log('Decoded refresh token:', decoded);

            const user = await User.findById(decoded.userId);
            console.log('User found for refresh token:', user);

            if (!user || !user.refreshTokens.includes(refreshToken)) {
                console.log('Refresh token not found in user:', refreshToken);
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const { token, refreshToken: newRefreshToken } = generateTokens(user._id);
            user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
            user.refreshTokens.push(newRefreshToken);
            await user.save();
            console.log('Updated user with new refresh token:', user);

            res.status(200).json({ token, refreshToken: newRefreshToken });
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Error refreshing token', error });
    }
};






// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // הסרת הסיסמה מהפלט
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // הסרת הסיסמה מהפלט
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { username, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, email },
            { new: true }
        ).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};
