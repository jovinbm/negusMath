var path = require('path');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var middleware = require('../functions/middleware.js');
var cuid = require('cuid');
var bcrypt = require('bcrypt');
var User = require("../database/users/user.js");
var Post = require("../database/posts/post.js");
var postsFn = require('../functions/postsFn.js');

//handlers
var user_handler = require('../handlers/user_handlers.js');
var post_handler = require('../handlers/post_handlers.js');
var basic_handlers = require('../handlers/basic_handlers.js');

var templatesDir = path.join(__dirname, '../views/emails/my-templates');
var emailTemplates = require('email-templates');


var fileName = 'router.js';

var receivedLogger = function (module) {
    var rL = require('../functions/basic.js').receivedLogger;
    rL(fileName, module);
};

var successLogger = function (module, text) {
    var sL = require('../functions/basic.js').successLogger;
    return sL(fileName, module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('../functions/basic.js').errorLogger;
    return eL(fileName, module, text, err);
};

function getTheUser(req) {
    return basic.getTheUser(req);
}

module.exports = {
    index_Html: function (req, res) {
        var module = 'index_Html';
        receivedLogger(module);

        var main = {
            title: 'Negus Math - College Level Advanced Mathematics for Kenya Students',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };
        res.render('index/index.ejs', main);

    },

    renderHome_Html: function (req, res) {
        var module = 'renderHome_Html2';
        receivedLogger(module);

        var main = {
            title: 'Negus Math - HomePage',
            state: 'home',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };

        post_handler.getPosts(null, null, 1, gotPosts);
        function gotPosts(rawPosts) {
            main.postsCount = rawPosts.postsCount;
            postsFn.preparePosts(null, rawPosts.postsArray, postsPrepared);

            function postsPrepared(posts) {
                main.allPosts = posts;

                post_handler.getSuggestedPosts(null, null, 5, gotSuggested);
                function gotSuggested(suggestedPosts) {
                    postsFn.preparePosts(null, suggestedPosts.postsArray, suggestedPrepared);

                    function suggestedPrepared(suggestedPosts) {
                        main.suggestedPosts = suggestedPosts.postsArray;

                        post_handler.getPopularStories(null, null, 7, gotPopular);
                        function gotPopular(popularStories) {
                            postsFn.preparePosts(null, popularStories.popularStories, popularPrepared);

                            function popularPrepared(popularStories) {
                                main.popularStories = popularStories;
                                res.render('all/main2.ejs', main);
                            }
                        }
                    }
                }
            }
        }
    },

    renderIndividualPost: function (req, res) {
        var module = 'renderIndividualPost';
        receivedLogger(module);

        var main = {
            title: 'Negus Math - Post',
            state: 'post',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };

        var postIndex = parseInt(req.params.postIndex);

        post_handler.getPost(null, null, postIndex, gotPost);
        function gotPost(rawPost) {
            postsFn.preparePosts(rawPost.thePost, null, postPrepared);

            function postPrepared(post) {
                main.post = post;
                main.title = post.postHeading;

                post_handler.getSuggestedPosts(null, null, 5, gotSuggested);
                function gotSuggested(suggestedPosts) {
                    postsFn.preparePosts(null, suggestedPosts.postsArray, suggestedPrepared);

                    function suggestedPrepared(suggestedPosts) {
                        main.suggestedPosts = suggestedPosts.postsArray;

                        post_handler.getPopularStories(null, null, 7, gotPopular);
                        function gotPopular(popularStories) {
                            postsFn.preparePosts(null, popularStories.popularStories, popularPrepared);

                            function popularPrepared(popularStories) {
                                main.popularStories = popularStories;
                                res.render('all/main2.ejs', main);
                                //res.status(200).send(main);
                            }
                        }
                    }
                }
            }
        }
    },

    manage_users: function (req, res) {
        var module = 'manage_users';
        receivedLogger(module);

        var main = {
            title: 'Manage Users - NegusMath',
            state: 'manage-users',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };

        res.render('all/main2.ejs', main);
    },

    new_post: function (req, res) {
        var module = 'new_post';
        receivedLogger(module);

        var main = {
            title: 'New Post - NegusMath',
            state: 'new-post',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };

        res.render('all/main2.ejs', main);
    },

    edit_post: function (req, res) {
        var module = 'edit_post';
        receivedLogger(module);

        var main = {
            title: 'Edit Post - NegusMath',
            state: 'edit-post',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };

        var postIndex = parseInt(req.params.postIndex);

        post_handler.getPost(null, null, postIndex, gotPost);
        function gotPost(rawPost) {
            postsFn.preparePostsNoChange(rawPost.thePost, null, postPrepared);

            function postPrepared(post) {
                main.post = post;
                res.render('all/main2.ejs', main);
                //res.status(200).send(main);
            }
        }
    },

    search_posts: function (req, res) {
        var module = 'search_posts';
        receivedLogger(module);

        var main = {
            title: 'Search - NegusMath',
            state: 'search-posts',
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };

        if (req.params.queryString && req.params.pageNumber) {
            main.limit = 20;
            main.queryString = req.params.queryString;
            main.title = main.queryString + ' - NegusMath Search';
            main.pageNumber = req.params.pageNumber;

            post_handler.mainSearch(null, null, main.queryString, main.limit, main.pageNumber, searchFinished);

            function searchFinished(searchResults) {
                main.postResultPage = searchResults.results.page;
                main.totalPostResultsPages = searchResults.results.totalPages;
                main.totalPostResults = searchResults.results.totalResults;

                postsFn.preparePosts(null, searchResults.results.posts, postsPrepared);

                function postsPrepared(posts) {
                    main.postResults = posts;

                    post_handler.getSuggestedPosts(null, null, 5, gotSuggested);
                    function gotSuggested(suggestedPosts) {
                        postsFn.preparePosts(null, suggestedPosts.postsArray, suggestedPrepared);

                        function suggestedPrepared(suggestedPosts) {
                            main.suggestedPosts = suggestedPosts.postsArray;

                            post_handler.getPopularStories(null, null, 7, gotPopular);
                            function gotPopular(popularStories) {
                                postsFn.preparePosts(null, popularStories.popularStories, popularPrepared);

                                function popularPrepared(popularStories) {
                                    main.popularStories = popularStories;
                                    res.render('all/main2.ejs', main);
                                }
                            }
                        }
                    }
                }
            }

        } else {
            consoleLogger(errorLogger(module, 'Some request fields missing'));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error has occurred. Please try again'
            });
        }
    },

    renderEmail: function (req, res) {
        var module = 'renderEmail';
        receivedLogger(module);

        var temp = {
            firstName: 'NegusMath',
            lastName: 'User',
            email: ''
        };

        if (req.isAuthenticated()) {
            middleware.returnUserData(req, success);
        } else {
            success(temp);
        }


        function success(theUser) {

            //check that theUser is not false
            if (!theUser) {
                theUser = temp;
            }
            var templateGroup = req.params.templateGroup;

            emailTemplates(templatesDir, function (err, template) {
                if (err) {
                    consoleLogger(errorLogger(module, 'retrieving template directory', err));
                    res.status(500).send('An error has occurred. Please try again');
                } else {
                    var locals = {
                        email: theUser.email,
                        firstName: theUser.firstName,
                        lastName: theUser.lastName
                    };

                    template(templateGroup, locals, function (err, html, text) {
                        if (err) {
                            consoleLogger(errorLogger(module, 'error parsing email template/template not found. Sending not-found', err));
                            template('not-found', locals, function (err, html, text) {
                                if (err) {
                                    consoleLogger(errorLogger(module, 'error parsing email template/template not found', err));
                                    res.status(500).send('An error has occurred. Please try again');
                                } else {
                                    consoleLogger(successLogger(module, "sent not-found template due to error"));
                                    res.status(200).send(html);
                                }
                            });
                        } else {
                            consoleLogger(successLogger(module));
                            res.status(200).send(html);
                        }
                    });
                }
            })
        }
    }
};