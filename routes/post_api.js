var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var post_handler = require('../handlers/post_handlers.js');
var userDB = require('../db/user_db.js');

var fileName = 'post_api.js';

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


    getPosts: function (req, res) {
        var module = 'getPosts';
        receivedLogger(module);
        if (req.body.page) {
            var page = req.body.page;
            post_handler.getPosts(req, res, page);
        } else {
            consoleLogger(errorLogger(module, 'Some request fields missing'));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error has occurred. Please reload page',
                disable: true
            });
        }
    },

    getSuggestedPosts: function (req, res) {
        var module = 'getSuggestedPosts';
        receivedLogger(module);
        var quantity = 4;
        post_handler.getSuggestedPosts(req, res, quantity);
    },

    getPost: function (req, res) {
        var module = 'getPost';
        receivedLogger(module);
        if (req.body.postIndex) {
            var postIndex = req.body.postIndex;
            post_handler.getPost(req, res, postIndex);
        } else {
            consoleLogger(errorLogger(module, 'Some request fields missing'));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error has occurred. Please reload page',
                disable: true
            });
        }
    },


    newPost: function (req, res) {
        var module = 'newPost';
        receivedLogger(module);
        post_handler.newPost(req, res, req.body.newPost);
    },


    updatePost: function (req, res) {
        var module = 'updatePost';
        receivedLogger(module);
        if (req.body.postUpdate) {
            var postUpdate = req.body.postUpdate;
            post_handler.updatePost(req, res, postUpdate);
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

    trashPost: function (req, res) {
        var module = 'trashPost';
        receivedLogger(module);
        if (req.body.postUniqueCuid) {
            var postUniqueCuid = req.body.postUniqueCuid;
            post_handler.trashPost(req, res, postUniqueCuid);
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

    unTrashPost: function (req, res) {
        var module = 'unTrashPost';
        receivedLogger(module);
        if (req.body.postUniqueCuid) {
            var postUniqueCuid = req.body.postUniqueCuid;
            post_handler.unTrashPost(req, res, postUniqueCuid);
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

    deletePost: function (req, res) {
        var module = 'deletePost';
        receivedLogger(module);
        if (req.body.postUniqueCuid) {
            var postUniqueCuid = req.body.postUniqueCuid;
            post_handler.deletePost(req, res, postUniqueCuid);
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


    getPopularStories: function (req, res) {
        var module = 'getPopularStories';
        receivedLogger(module);
        var quantity = 7;
        post_handler.getPopularStories(req, res, quantity);
    },


    mainSearch: function (req, res) {
        var module = 'mainSearch';
        receivedLogger(module);
        if (req.body.queryString && req.body.requestedPage) {
            var quantity = 20;
            var requestedPage = req.body.requestedPage;
            var queryString = req.body.queryString;

            post_handler.mainSearch(req, res, queryString, quantity, requestedPage);
        } else {
            consoleLogger(errorLogger(module, 'Some request fields missing'));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error has occurred. Please try again'
            });
        }
    }
};