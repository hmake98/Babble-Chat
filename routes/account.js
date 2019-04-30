var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Room = require('../models/room');

router.get('/', function (req, res, next) {
    if (req.session.user) {
        res.redirect('/account/' + req.session.user[0].username);
    } else {
        res.render('account');
    }
});

router.get('/:username', (req, res) => {
    //var io = req.app.get('socketio');
    User.find({
      username: {
        $ne: req.params.username
      }
    }).then(users => {
      User.findOne({
        username: req.params.username
      }).then(user => {    
        res.render('account', {
          users: users,
          user: user
        });
      })
    });
  });

module.exports = router;