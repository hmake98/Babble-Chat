var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Room = require('../models/room');
var Chat = require('../models/chat');

router.get('/', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.render('home');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/:chaterid', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        Room.findOne({
            users: {
                $all: [req.params.chaterid, req.session.user[0]._id]
            }
        }).then(room => {
            Chat.find({
                roomid: room._id
            }).then(chat => {
                User.find({
                    _id: {
                        $ne: req.session.user[0]._id
                    }
                }).then(users => {
                    res.render('chats', {
                        chatter: req.params.chaterid,
                        user: req.session.user[0],
                        users: users,
                        chats: chat
                    });
                });
            });
        });
    }
});

module.exports = router;