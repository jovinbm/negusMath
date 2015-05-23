var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var userDB = require('../db/user_db.js');
var forms = require('../functions/forms.js');
var emailModule = require('../functions/email.js');

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
    return basic.getTheUser(req);
}

module.exports = {

    getUsersCount: function (req, res) {
        var module = 'getUsersCount';
        receivedLogger(module);

        userDB.getUsersCount(error, error, success);

        function success(usersCount) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                usersCount: usersCount
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning'
            });
        }
    },

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

    addAdminPrivileges: function (req, res, userUniqueCuid) {
        var module = 'addAdminPrivileges';
        receivedLogger(module);

        userDB.addAdminPrivileges(userUniqueCuid, error_neg_1, error_0, success);

        function success(user) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                user: user,
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Saved'
            });
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed execute your request. Please try again or reload page if problem persists'
            });
        }

        function error_0() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'User was not found on database'
            });
        }
    },

    removeAdminPrivileges: function (req, res, userUniqueCuid) {
        var module = 'removeAdminPrivileges';
        receivedLogger(module);

        userDB.removeAdminPrivileges(userUniqueCuid, error_neg_1, error_0, success);

        function success(user) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                user: user,
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Saved'
            });
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed execute your request. Please try again or reload page if problem persists'
            });
        }

        function error_0() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'User was not found on database'
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

    approveUser: function (req, res, userUniqueCuid) {
        var module = 'approveUser';
        receivedLogger(module);

        userDB.approveUser(userUniqueCuid, error_neg_1, error_0, success);

        function success(user) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                user: user,
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Saved'
            });

            //send approved email
            emailModule.sendAccountApprovedEmail(user);
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed execute your request. Please try again or reload page if problem persists'
            });
        }

        function error_0() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'User was not found on database'
            });
        }
    },

    getUsersNotApproved: function (req, res) {
        var module = 'getUsersNotApproved';
        receivedLogger(module);

        userDB.getUsersNotApproved(error, error, success);

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

    banUser: function (req, res, userUniqueCuid) {
        var module = 'banUser';
        receivedLogger(module);

        userDB.banUser(userUniqueCuid, error_neg_1, error_0, success);

        function success(user) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                user: user,
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Saved'
            });
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed execute your request. Please try again or reload page if problem persists'
            });
        }

        function error_0() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'User was not found on database'
            });
        }
    },

    unBanUser: function (req, res, userUniqueCuid) {
        var module = 'unBanUser';
        receivedLogger(module);

        userDB.unBanUser(userUniqueCuid, error_neg_1, error_0, success);

        function success(user) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                user: user,
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Saved'
            });
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed execute your request. Please try again or reload page if problem persists'
            });
        }

        function error_0() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'User was not found on database'
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