var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var Handlebars = require('handlebars');
var nodemailer = require('nodemailer');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('forgot');
});

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

router.post('/submit', (req, res) => {
    if (req.body.email) {
        User.find({
            email: req.body.email
        }).then(user => {
            if (user.length == 0) {
                res.render('forgot', {
                    message: "No email id found! Please enter valid email"
                });
            } else {
                crypto.randomBytes(20, function (err, buf) {
                    let token = buf.toString('hex');
                    //console.log("Before: "+user);
                    User.update({_id: user[0]._id}, {
                        $set: {
                            resetToken: token,
                            resetExpire: Date.now()
                        }
                    }, {
                        new: true
                    }, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            readHTMLFile(path.join(__dirname, '../public/emailmsg.hbs'), function(err, html) {
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
                                    to: req.body.email,
                                    subject: "Password reset",
                                    html: template({
                                        username: user[0].username,
                                        message: "You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process. If you did not request this, please ignore this email and your password will remain unchanged.",
                                        token: token
                                    })
                                };

                                transporter.sendMail(mailOptions, (err, info) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                });
                            });
                        }
                    });
                    
                });
            }
            res.render('forgot', { message: "Your reset password link sent to your email."});
        }).catch(err => {
            res.status(500).json({
                success: false,
                message: "Invalid request!",
                error: err
            });
        })
    }
});

module.exports = router;
