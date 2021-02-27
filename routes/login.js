var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.user) {
        res.redirect('/home/' + req.session.user[0].username);
    } else {
        res.render('login');
    }
});

router.post('/submit', (req, res) => {
    const { username, password } = req.body
    if (username && password) {
        User.find({
            username
        }).then(users => {
            if (users.length == 0) {
                // req.flash('error', 'error');
                res.render('login', {
                    message: "No user found!"
                });
            } else {
                // console.log(users)
                const exist_user = users[0];
                bcrypt.compare(password, exist_user.password, (err, isMatch) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: "Something went wrong!",
                            error: err
                        });
                    } else {
                        if (isMatch) {
                            req.session.user = exist_user;
                            res.redirect('/home/' + exist_user.username);
                        } else {
                            res.render('login', {
                                message: "Password is invalid!"
                            });
                        }
                    }
                })
            }
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: "Invalid user!",
                error: err
            });
        });
    } else {
        res.render('login', {
            message: "Enter valid credentials"
        });
    }
});

module.exports = router;