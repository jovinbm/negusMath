var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var userDB = require('../db/user_db.js');
var forms = require('../functions/forms.js');

var fileName = 'user_handlers.js';

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

        userDB.getAllUsers(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve all users. Please reload page'
            });
        }
    },

    getAdminUsers: function (req, res) {
        var module = 'getAdminUsers';
        receivedLogger(module);

        userDB.getAdminUsers(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve admin users. Please reload page'
            });
        }
    },

    getLocalUsers: function (req, res) {
        var module = 'getLocalUsers';
        receivedLogger(module);

        userDB.getLocalUsers(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve local users. Please reload page'
            });
        }
    },

    getApprovedUsers: function (req, res) {
        var module = 'getApprovedUsers';
        receivedLogger(module);

        userDB.getApprovedUsers(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve approved users users. Please reload page'
            });
        }
    },

    getUnApprovedUsers: function (req, res) {
        var module = 'getUnApprovedUsers';
        receivedLogger(module);

        userDB.getUnApprovedUsers(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve unApprovedUsers users. Please reload page'
            });
        }
    },

    getBannedUsers: function (req, res) {
        var module = 'getBannedUsers';
        receivedLogger(module);

        userDB.getBannedUsers(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve banned users. Please reload page'
            });
        }
    },

    getUsersNotBanned: function (req, res) {
        var module = 'getUsersNotBanned';
        receivedLogger(module);

        userDB.getUsersNotBanned(error, error, success);

        function success(usersArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersArray: usersArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve users not banned. Please reload page'
            });
        }
    }

};