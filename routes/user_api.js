var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var user_handler = require('../handlers/user_handlers.js');
var userDB = require('../db/user_db.js');

var fileName = 'user_api.js';

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

    getAllUsers: function (req, res) {
        var module = 'getAllUsers';
        receivedLogger(module);
        user_handler.getAllUsers(req, res);
    },

    getAdminUsers: function (req, res) {
        var module = 'getAdminUsers';
        receivedLogger(module);
        user_handler.getAdminUsers(req, res);
    },

    getLocalUsers: function (req, res) {
        var module = 'getLocalUsers';
        receivedLogger(module);
        user_handler.getLocalUsers(req, res);
    },

    getApprovedUsers: function (req, res) {
        var module = 'getApprovedUsers';
        receivedLogger(module);
        user_handler.getApprovedUsers(req, res);
    },

    getUnApprovedUsers: function (req, res) {
        var module = 'getUnApprovedUsers';
        receivedLogger(module);
        user_handler.getUnApprovedUsers(req, res);
    },

    getBannedUsers: function (req, res) {
        var module = 'getBannedUsers';
        receivedLogger(module);
        user_handler.getBannedUsers(req, res);
    },

    getUsersNotBanned: function (req, res) {
        var module = 'getUsersNotBanned';
        receivedLogger(module);
        user_handler.getUsersNotBanned(req, res);
    }

};