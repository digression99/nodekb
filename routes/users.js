const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

var User = require('../models/user');

router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required.').notEmpty();
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Email is not valid.').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not matched.').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors : errors
        });
    } else {
        var newUser = new User({
            name : name,
            email : email,
            username : username,
            password : password
        });

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.password, salt, function(err, hash) {
                if (err) { console.log(err);}
                else {
                    newUser.password = hash;
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'You are now registered and can log in.');
                            res.redirect('/user/login');
                        }
                    })

                }
            });
        });
    }
});

router.get('/login', function(req, res) {
    res.render('login');
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are logged out.');
    res.redirect('/user/login');
});


module.exports = router;

