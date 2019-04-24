var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcrypt');
var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');
var nodemailer = require('nodemailer');

var readHTMLFile = function (path, callback) {
    fs.readFile(path, {
        encoding: 'utf-8'
    }, function (err, html) {
        if (err) {
            callback(err);
        } else {
            callback(null, html);
        }
    });
};

router.get('/:token', function (req, res, next) {
    if (req.params.token) {
        token = req.params.token;
        User.findOne({
            resetToken: req.params.token
        }).then(user => {
            if (!user) {
                res.redirect('/forgot');
            } else {
                if (parseInt(Date.now()) - parseInt(user['resetExpire']) > 600000) {
                    res.json({
                        success: false,
                        message: "Token expired! LOL"
                    });
                } else {
                    res.render('reset', {
                        token: req.params.token
                    });
                }
            }
        })
    }
});

router.post('/submit', (req, res) => {
    if (req.body.password && req.body.cfrmpas) {
        if (req.body.password !== req.body.cfrmpas) {
            res.render('reset', {
                message: "Password didn't match."
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                User.update({
                    resetToken: req.body.token
                }, {
                    $set: {
                        password: hash
                    }
                }, (err, resp) => {
                    if (err) {
                        console.log(err);
                    } else {
                        User.findOne({
                            resetToken: req.body.token
                        }).then(user => {
                            readHTMLFile(path.join(__dirname, '../public/emailsuccess.hbs'), function (err, html) {
                                var template = Handlebars.compile(html);
                                let transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'rcbrcb13',
                                        pass: 'simple.123'
                                    }
                                });

                                let mailOptions = {
                                    from: 'rcbrcb13@gmail.com',
                                    to: user.email,
                                    subject: "Password reset",
                                    html: template({
                                        username: user.username,
                                        message: "Your Password is successfully changed!"
                                    })
                                };

                                transporter.sendMail(mailOptions, (err, info) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                });
                            });
                        }).catch(err => {
                            res.json({
                                success: false,
                                message: "Somwthing went wrong!",
                                error: err
                            });
                        });
                        res.redirect('/login');
                    }
                });
            });
        }
    } else {
        res.render('reset', {
            message: "Enter password"
        });
    }
});

module.exports = router;
