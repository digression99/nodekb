const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');

const bcrypt = require('bcryptjs');

// var passport = require('passport')
//     , LocalStrategy = require('passport-local').Strategy;
//
// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         User.findOne({ username: username }, function (err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//         });
//     }
// ));

module.exports = function(passport) {

    // local strategy
    passport.use(new LocalStrategy(function(username, password, done) {
        var query = {username:username};
        User.findOne(query, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'no user found.'});
            }

            // match password
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (err) { throw err;}
                if (isMatch)
                {
                    return done(null, user);
                }
                else {
                    return done(null, false, {message: 'wrong password.'});
                }
            });
        })
    }));

    passport.serializeUser(function(user, done) {
        console.log('serializing user...');
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log('deserailizing user...');
        console.log('user info : ', id);

        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};