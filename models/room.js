const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    users:[Schema.Types.ObjectId]
},{
    timestamps: true
});

const Room = mongoose.model('room', roomSchema);

module.exports = Room;