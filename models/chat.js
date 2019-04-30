const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    userid:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    username:{
        type: String
    },
    roomid:{
        type: Schema.Types.ObjectId,
        ref: 'rooms'
    },
    message:{
        type: String
    },
    created:{
        type: String
    }
},{
    timestamps: true
});

const Chat = mongoose.model('chat', chatSchema);

module.exports = Chat;