var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.user) {
    res.redirect('/home/' + req.session.user[0].username);
  } else {
    res.render('index');
  }
});

router.post('/signup', (req, res) => {
  if (req.body.username && req.body.email && req.body.password) {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        console.log(err)
      } else {
        User.findOne({
          username: req.body.username
        }).then(user => {
          if (user) {
            res.render('index', {
              message: "User already exist!"
            });
          } else {
            req.body.password = hash
            User.create(req.body).then(user => {
              req.session.user = user
              res.redirect('/login');
            }).catch(err => {
              res.status(500).json({
                success: false,
                message: "Unable to add user.",
                error: err
              });
            })
          }
        })
      }
    })
  } else {
    res.render('index', {
      message: "Please enter valid credentials."
    });
  }
});

module.exports = router;