var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var postDB = require('../db/post_db.js');
var forms = require('../functions/forms.js');
var emailModule = require('../functions/email.js');

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
    return basic.getTheUser(req);
}

module.exports = {


    newPost: function (req, res, theNewPost) {
        var module = 'newPost';
        receivedLogger(module);

        //theNewPost consists of the theNewPost.heading and theNewPost.content

        if (req && res) {
            forms.validateNewPost(req, res, theNewPost, postValidated);
        } else {
            postValidated();
        }

        function postValidated() {
            postDB.makeNewPost(req, res, theNewPost, made);

            function made(post) {
                postDB.saveNewPost(post, error, error, saved);

                function saved(savedPost) {
                    consoleLogger(successLogger(module));
                    res.status(200).send({
                        thePost: savedPost,
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

        if (req && res) {
            forms.validateNewPost(req, res, thePost, postValidated);
        } else {
            postValidated();
        }

        function postValidated() {
            postDB.makePostUpdate(req, res, thePost, made);

            function made(post) {
                postDB.updatePost(post, error, error, updated);

                function updated(updatedPost) {
                    consoleLogger(successLogger(module));
                    res.status(200).send({
                        thePost: updatedPost,
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

    getPosts: function (req, res, page, quantity, callBack) {
        var module = 'getPosts';
        receivedLogger(module);

        var limit = quantity;

        postDB.getPosts(-1, page, limit, error_neg_1, error_neg_1, success);

        function success(postsArray, postsCount) {
            var temp = {};
            temp['postsCount'] = postsCount;
            temp['postsArray'] = postsArray;
            consoleLogger(successLogger(module));
            if (res) {
                res.status(200).send(temp);
            }

            if (callBack) {
                temp.code = 200;
                callBack(temp);
            }
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            if (res) {
                res.status(500).send({
                    code: 500,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: 'Failed to retrieve posts. Please reload this page',
                    disable: true
                });
            }

            if (callBack) {
                var temp = {
                    code: 500,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: 'Failed to retrieve posts. Please reload this page',
                    disable: true
                };
                callBack(temp);
            }
        }
    },

    getSuggestedPosts: function (req, res, quantity, callBack) {
        var module = 'getSuggestedPosts';
        receivedLogger(module);

        postDB.getSuggestedPosts(quantity, error, error, success);

        function success(postsArray) {
            var temp = {};
            temp['postsArray'] = postsArray;
            consoleLogger(successLogger(module));
            if (res) {
                res.status(200).send(temp);
            }

            if (callBack) {
                temp.code = 200;
                callBack(temp);
            }
        }

        function error() {
            var temp = {};
            temp['postsArray'] = [];
            consoleLogger(successLogger(module));
            if (res) {
                res.status(200).send(temp);
            }

            if (callBack) {
                temp.code = 200;
                callBack(temp);
            }
        }
    },


    getPost: function (req, res, postIndex, callBack) {
        var module = 'getPost';
        receivedLogger(module);

        postDB.getPost(postIndex, error_neg_1, postNotFoundError, success);

        function success(thePost) {
            consoleLogger(successLogger(module));
            if (res) {
                res.status(200).send({
                    thePost: thePost
                });
            }

            if (callBack) {
                var temp = {
                    code: 200,
                    thePost: thePost
                };
                callBack(temp);
            }
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            if (res) {
                res.status(500).send({
                    code: 500,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: 'Failed to retrieve this post. Please try again or reload this page',
                    disable: true
                });
            }

            if (callBack) {
                var temp = {
                    code: 500,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: 'Failed to retrieve this post. Please try again or reload this page',
                    disable: true
                };
                callBack(temp);
            }
        }

        function postNotFoundError() {
            //redirects user to home and puts a banner to show that the post is not available
            consoleLogger(errorLogger(module, 'Requested post not found'));
            if (res) {
                res.status(200).send({
                    thePost: {},
                    code: 200,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: "The post you're looking for is either deleted or has never existed before"
                });
            }

            if (callBack) {
                var temp = {
                    thePost: {},
                    code: 200,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: "The post you're looking for is either deleted or has never existed before"
                };
                callBack(temp);
            }
        }
    },

    getPopularStories: function (req, res, quantity, callBack) {
        var module = 'getPopularStories';
        receivedLogger(module);

        postDB.getPopularStories(quantity, error, error, success);

        function success(popularStoriesArray) {
            consoleLogger(successLogger(module));
            if (res) {
                res.status(200).send({
                    popularStories: popularStoriesArray
                });
            }

            if (callBack) {
                var temp = {
                    code: 200,
                    popularStories: popularStoriesArray
                };
                callBack(temp);
            }
        }

        function error() {
            consoleLogger(errorLogger(module));
            if (res) {
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'warning',
                    msg: 'Failed to retrieve this weeks top posts. Please reload page '
                });
            } else {
                return {
                    code: 500,
                    notify: true,
                    type: 'warning',
                    msg: 'Failed to retrieve this weeks top posts. Please reload page '
                }
            }

            if (callBack) {
                var temp = {
                    code: 500,
                    notify: true,
                    type: 'warning',
                    msg: 'Failed to retrieve this weeks top posts. Please reload page '
                };
                callBack(temp);
            }
        }
    },

    trashPost: function (req, res, postUniqueCuid) {
        var module = 'trashPost';
        receivedLogger(module);

        postDB.trashPost(req, res, postUniqueCuid, trashed);

        function trashed(trashedPost) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                code: 200,
                notify: true,
                type: 'success',
                msg: 'The post has been sent to trash'
            });
        }
    },

    unTrashPost: function (req, res, postUniqueCuid) {
        var module = 'unTrashPost';
        receivedLogger(module);

        postDB.unTrashPost(req, res, postUniqueCuid, unTrashed);

        function unTrashed(unTrashedPost) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                code: 200,
                notify: true,
                type: 'success',
                msg: 'The post has been sent to removed from trash'
            });
        }
    },

    deletePost: function (req, res, postUniqueCuid) {
        var module = 'deletePost';
        receivedLogger(module);

        postDB.deletePost(req, res, postUniqueCuid, deleted);

        function deleted() {
            consoleLogger(successLogger(module));
            res.status(200).send({
                code: 200,
                notify: true,
                type: 'success',
                msg: 'The post has been permanently deleted'
            });
        }
    },


    mainSearch: function (req, res, queryString, quantity, requestedPage, callBack) {
        var module = 'mainSearch';
        receivedLogger(module);

        if (req && res) {
            forms.validateMainSearchQuery(req, res, queryString, mainSearchQueryValidated);
        } else {
            mainSearchQueryValidated();
        }

        function mainSearchQueryValidated() {

            postDB.mainSearch(queryString, quantity, requestedPage, error, error, success);

            function success(resultObject) {
                consoleLogger(successLogger(module));

                if (res) {
                    res.status(200).send({
                        code: 200,
                        results: resultObject
                    });
                }

                if (callBack) {
                    var temp = {
                        code: 200,
                        results: resultObject
                    };
                    callBack(temp);
                }
            }

            function error() {
                consoleLogger(errorLogger(module));
                if (res) {
                    res.status(500).send({
                        code: 500,
                        notify: true,
                        type: 'warning',
                        msg: 'Something went wrong while trying to fetch the results. Please try again'
                    });
                }

                if (callBack) {
                    var temp = {
                        code: 500,
                        notify: true,
                        type: 'warning',
                        msg: 'Something went wrong while trying to fetch the results. Please try again'
                    };
                    callBack(temp);
                }
            }
        }
    }

};