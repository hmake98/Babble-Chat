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
  try {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      Room.find({
        users: []
      }).then(room => {
        if (!room.length) {
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
                rooms: room
              });
            })
          }).catch((err) => {
            console.log(err)
          });
        } else {
          if (room[0] && room[0]._id) {
            Chat.find({
              roomid: room[0]._id
            }).then(chat => {
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
                    chats: chat,
                    rooms: room
                  });
                })
              }).catch((err) => {
                console.log(err)
              });
            })
          } else {
            res.render('home', {});
          }
        }
      })
    }
  } catch (err) {
    console.log(err)
  }
});


module.exports = router;