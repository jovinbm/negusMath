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
    return basic.getTheUser(req);
}

function checkUserUniqueCuid(req) {
    if (req.body.userUniqueCuid) {
        return true;
    } else {
        return false;
    }
}


module.exports = {

    getUsersCount: function (req, res) {
        var module = 'getUsersCount';
        receivedLogger(module);
        user_handler.getUsersCount(req, res);
    },

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

    addAdminPrivileges: function (req, res) {
        var module = 'addAdminPrivileges';
        receivedLogger(module);

        if (checkUserUniqueCuid(req)) {
            var userUniqueCuid = req.body.userUniqueCuid;
            user_handler.addAdminPrivileges(req, res, userUniqueCuid);
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

    removeAdminPrivileges: function (req, res) {
        var module = 'removeAdminPrivileges';
        receivedLogger(module);

        if (checkUserUniqueCuid(req)) {
            var userUniqueCuid = req.body.userUniqueCuid;
            user_handler.removeAdminPrivileges(req, res, userUniqueCuid);
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

    approveUser: function (req, res) {
        var module = 'approveUser';
        receivedLogger(module);

        if (checkUserUniqueCuid(req)) {
            var userUniqueCuid = req.body.userUniqueCuid;
            user_handler.approveUser(req, res, userUniqueCuid);
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

    getUsersNotApproved: function (req, res) {
        var module = 'getUsersNotApproved';
        receivedLogger(module);
        user_handler.getUsersNotApproved(req, res);
    },

    getBannedUsers: function (req, res) {
        var module = 'getBannedUsers';
        receivedLogger(module);
        user_handler.getBannedUsers(req, res);
    },

    banUser: function (req, res) {
        var module = 'banUser';
        receivedLogger(module);

        if (checkUserUniqueCuid(req)) {
            var userUniqueCuid = req.body.userUniqueCuid;
            user_handler.banUser(req, res, userUniqueCuid);
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

    unBanUser: function (req, res) {
        var module = 'unBanUser';
        receivedLogger(module);

        if (checkUserUniqueCuid(req)) {
            var userUniqueCuid = req.body.userUniqueCuid;
            user_handler.unBanUser(req, res, userUniqueCuid);
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

    getUsersNotBanned: function (req, res) {
        var module = 'getUsersNotBanned';
        receivedLogger(module);
        user_handler.getUsersNotBanned(req, res);
    }

};