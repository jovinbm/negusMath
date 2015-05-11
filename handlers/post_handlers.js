var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var postDB = require('../db/post_db.js');
var forms = require('../functions/forms.js');

var fileName = 'post_handlers.js';

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
    return req.customData.theUser;
}

module.exports = {


    newPost: function (req, res, theNewPost) {
        var module = 'newPost';
        receivedLogger(module);

        //theNewPost consists of the theNewPost.heading and theNewPost.content

        forms.validateNewPost(req, res, theNewPost, postValidated);

        function postValidated() {
            postDB.makeNewPost(req, res, theNewPost, made);

            function made(post) {
                postDB.saveNewPost(post, error, error, saved);

                function saved(savedPost) {
                    consoleLogger(successLogger(module));
                    ioJs.emitToAll('newPost', {
                        "post": savedPost,
                        "postsCount": savedPost.postIndex
                    });
                    res.status(200).send({
                        code: 200,
                        notify: true,
                        type: 'success',
                        msg: 'You new post has been successfully saved'
                    });
                }
            }
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to createPost. Please try again'
            });
        }
    },

    updatePost: function (req, res, thePost) {
        var module = 'updatePost';
        receivedLogger(module);

        //theNewPost consists of the theNewPost.heading and theNewPost.content

        forms.validateNewPost(req, res, thePost, postValidated);

        function postValidated() {
            postDB.makePostUpdate(req, res, thePost, made);

            function made(post) {
                postDB.updatePost(post, error, error, updated);

                function updated(updatedPost) {
                    consoleLogger(successLogger(module));
                    ioJs.emitToAll('postUpdate', {
                        "post": updatedPost
                    });
                    res.status(200).send({
                        code: 200,
                        notify: true,
                        type: 'success',
                        msg: 'The post has been updated'
                    });
                }
            }
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to update post. Please try again'
            });
        }
    },


    getPosts: function (req, res, page) {
        var module = 'getPosts';
        receivedLogger(module);

        var limit = 10;

        postDB.getPosts(-1, page, limit, error_neg_1, error_neg_1, success);

        function success(postsArray, postsCount) {
            var temp = {};
            temp['postsCount'] = postsCount;
            temp['postsArray'] = postsArray;
            consoleLogger(successLogger(module));
            res.status(200).send(temp);
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'Failed to retrieve your personalized posts. Please reload this page',
                disable: true
            });
        }
    },

    getSuggestedPosts: function (req, res, quantity) {
        var module = 'getSuggestedPosts';
        receivedLogger(module);

        postDB.getSuggestedPosts(quantity, error, error, success);

        function success(postsArray) {
            var temp = {};
            temp['postsArray'] = postsArray;
            consoleLogger(successLogger(module));
            res.status(200).send(temp);
        }

        function error() {
            var temp = {};
            temp['postsArray'] = [];
            consoleLogger(successLogger(module));
            res.status(200).send(temp);
        }
    },


    getPost: function (req, res, postIndex) {
        var module = 'getPost';
        receivedLogger(module);

        postDB.getPost(postIndex, error_neg_1, postNotFoundError, success);

        function success(thePost) {
            res.status(200).send({
                thePost: thePost
            });
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'Failed to retrieve this post. Please try again or reload this page',
                disable: true
            });
        }

        function postNotFoundError() {
            //redirects user to home and puts a banner to show that the post is not available
            consoleLogger(errorLogger(module, 'Requested post not found'));
            res.status(200).send({
                thePost: {},
                code: 200,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: "The post you're looking for is either deleted or has never existed before"
            });
        }
    },

    getHotThisWeek: function (req, res, quantity) {
        var module = 'getHotThisWeek';
        receivedLogger(module);

        postDB.getHotThisWeek(quantity, error, error, success);

        function success(hotThisWeekArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                hotThisWeek: hotThisWeekArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve this weeks top posts. Please reload page '
            });
        }
    },


    mainSearch: function (req, res, queryString, quantity, searchUniqueCuid, requestedPage) {
        var module = 'mainSearch';
        receivedLogger(module);

        forms.validateMainSearchQuery(req, res, queryString, mainSearchQueryValidated);

        function mainSearchQueryValidated() {

            postDB.mainSearch(queryString, quantity, searchUniqueCuid, requestedPage, error, error, success);

            function success(resultValue) {
                //gets a return value with the postUniqueCuids
                postDB.getPostsWithUniqueCuids(resultValue.postUniqueCuids, error, found, found);

                function found(postsArray) {
                    resultValue["postsArray"] = postsArray;
                    consoleLogger(successLogger(module));
                    res.status(200).send({
                        results: resultValue
                    });
                }
            }

            function error() {
                consoleLogger(errorLogger(module));
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'warning',
                    msg: 'Something went wrong while trying to fetch the results. Please try again'
                });
            }
        }
    }

};