const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// הצפנת סיסמה לפני שמירת משתמש
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     try {
//         console.log('Password before hashing:', this.password);
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         console.log('Password after hashing:', this.password);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });


// פונקציה להשוואת סיסמאות (לא חובה, אך שימושי)
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.model('User', userSchema);
