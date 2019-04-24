var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login');
});

router.post('/submit', (req, res) => {
    if (req.body.username && req.body.password) {
        User.find({
            username: req.body.username
        }).then(user => {
            if (user.length == 0) {
                req.flash('error', 'error');
                res.render('login', {
                    message: "No account found!"
                });
            } else {
                user.forEach(element => {
                    bcrypt.compare(req.body.password, element.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                            res.json({
                                success: false,
                                message: "Something went wrong!",
                                error: err
                            });
                        } else {
                            if (isMatch) {
                                req.session.user = user;
                                res.redirect('/home');
                            } else {
                                res.render('login', {
                                    message: "Password is invalid!"
                                });
                            }
                        }
                    })
                })
            }
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: "Invalid user",
                error: err
            });
        });
    }else{
        res.render('login', { message: "Enter valid credentials"});
    }
});

module.exports = router;