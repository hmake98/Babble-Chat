const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    username:{
        type: String,
        required:[true, 'Username is required']
    },
    created:{
        type: Date
    },
    room:{
        type: String    
    }
});

const Chat = mongoose.model('user', chatSchema);

module.exports = Chat;