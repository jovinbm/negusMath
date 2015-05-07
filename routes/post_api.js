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
    return req.customData.theUser;
}


module.exports = {


    getPosts: function (req, res) {
        var module = 'getPosts';
        receivedLogger(module);
        var page = req.body.page;
        post_handler.getPosts(req, res, page);
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
        var postIndex = req.body.postIndex;
        post_handler.getPost(req, res, postIndex);
    },


    newPost: function (req, res) {
        var module = 'newPost';
        receivedLogger(module);
        post_handler.newPost(req, res, req.body.newPost);
    },


    updatePost: function (req, res) {
        var module = 'updatePost';
        receivedLogger(module);
        var postUpdate = req.body.postUpdate;
        post_handler.updatePost(req, res, postUpdate);
    },


    getHotThisWeek: function (req, res) {
        var module = 'getHotThisWeek';
        receivedLogger(module);
        var quantity = 7;
        post_handler.getHotThisWeek(req, res, quantity);
    },


    searchForPosts: function (req, res) {
        var module = 'searchForPosts';
        receivedLogger(module);
        var quantity = 10;
        var queryString = req.body.queryString;
        consoleLogger("*****queryString = " + queryString);
        post_handler.searchForPosts(req, res, queryString, quantity);
    }
};