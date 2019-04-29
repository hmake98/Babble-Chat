const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    room:{
        type: String    
    },
    users:{
        type: Array
    },
    chat:{
        type: Object
    }
});

const Room = mongoose.model('room', roomSchema);

module.exports = Room;