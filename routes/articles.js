const express = require('express');
const router = express.Router();
const User = require('../models/user');

module.exports = function(Article) {

    router.get('/add', ensureAuthenticated, function(req, res) {
        res.render('add_article', {
            title : 'add article'
        });
    });

    router.post('/add', function(req, res) {
        // 제출하기 전에 검사한다.
        req.checkBody('title', 'Title is required.').notEmpty();
        //req.checkBody('author', 'Author is required.').notEmpty();
        req.checkBody('body', 'Body is required.').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            res.render('add_article', {
                title : 'Add Article',
                errors : errors
            })

        } else {
            var article = new Article();
            article.title = req.body.title;
            article.author = req.user._id;
            article.body = req.body.body;

            article.save(function(err) {
                if (err) {
                    console.log(err);
                }
                else {
                    req.flash('success', 'Article Added.');
                    res.redirect('/');
                }
            });
        }
    });

// get single article
    router.get('/:id', function(req, res) {
        console.log('get article.');
        console.log('user data : ', req.user);
        Article.findById(req.params.id, function(err, article) {
            User.findById(article.author, function(err, user) {
                res.render('article', {
                    article : article,
                    author : user.name
                });
            })
        });
    });

// get single article
    router.get('/edit/:id', ensureAuthenticated, function(req, res) {
        // Article.findById(req.params.id, function(err, article) {
        //     if (article.author !== req.user._id) {
        //         req.flash('danger', 'Not Authrized');
        //         res.redirect('/user/login');
        //     }
        //     else {
        //
        //     }
        // });

        Article.findById(req.params.id, function(err, article) {
            console.log('article.findById.');
            console.log('article.author : ', article.author, " type is : ", typeof(article.author));
            console.log('req.user._id : ', req.user._id.toString(), " type is : ", typeof(req.user._id.toString()));

            if (article.author !== req.user._id.toString())
            {
                req.flash('danger', 'Not Authorized');
                res.redirect('/');
            }
            else {
                res.render('edit_article', {
                    title : 'Edit Article',
                    article : article,
                    author : req.user.name
                });
            }
        });
    });

    router.post('/edit/:id', function(req, res) {
        var newArticle = {};
        newArticle.title = req.body.title;
        newArticle.body = req.body.body;

        var query = {_id:req.params.id};

        // 두번 쿼리하는 데 쿼리를 줄일 순 없을까.
        Article.findById(query, function(err, article)
        {
            if (err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                newArticle.author = article.author;
                Article.update(query, newArticle, function(err) {
                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        req.flash('success','Article Updated.');
                        res.redirect('/article/' + req.params.id);
                    }
                });
            }
        });
    });

    router.delete('/:id', function(req, res) {
        if (!req.user._id)
        {
            res.status(500).send();
        }

        var query = {_id : req.params.id};

        Article.findById(req.params.id, function(err, article) {
            if (article.author !== req.user._id.toString())
            {
                res.status(500).send();
            } else
            {
                Article.remove(query, function(err) {
                    if (err) {
                        console.log('article remove error!', err);
                    }
                    else{
                        res.send('success');
                    }
                });
            }
        });
    });

    // access control
    // 이 함수를 라우터에서 주소 다음 인자로 넣어준다.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated())
        {
            return next();
        }
        else {
            req.flash('danger','Please log in.');
            res.redirect('/user/login');
        }
    }

    return router;
};