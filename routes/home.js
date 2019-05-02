var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Room = require('../models/room');
var Chat = require('../models/chat');

/* GET home page. */
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

router.get('/:username', (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    Room.findOne({
      users: []
    }).then(room => {
      Chat.find({
        roomid: room._id
      }).then(chat => {
        //var io = req.app.get('socketio');
        User.find({
          username: {
            $ne: req.params.username
          }
        }).then(users => {
          User.findOne({
            username: req.params.username
          }).then(user => {
            res.render('home', {
              users: users,
              user: user,
              chats: chat
            });
          })
        });
      })
    })
  }
});


module.exports = router;