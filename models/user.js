const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required:[true, 'Username is required']
    },
    email:{
        type: String,
        required: [true, 'Email is required']
    },
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    resetToken:{
        type: String
    },
    resetExpire:{
        type: String
    }
});

const User = mongoose.model('user', userSchema);

module.exports = User;