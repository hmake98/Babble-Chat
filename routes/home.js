var express = require('express');
var router = express.Router();
var User = require('../models/user');

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
  // var io = req.app.get('socketio');
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
        user: user
      });
    })
  });
});


module.exports = router;