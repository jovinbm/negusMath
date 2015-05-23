var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;

var fileName = 'middleware.js';

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

    //authenticates requests
    ensureAuthenticated: function (req, res, next) {
        var module = "ensureAuthenticated";
        receivedLogger(module);

        if (req.isAuthenticated()) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'user authentication failed'));
            res.redirect('index');
        }
    },

    ensureAuthenticatedAngular: function (req, res, next) {
        var module = "ensureAuthenticatedAngular";
        receivedLogger(module);
        if (req.isAuthenticated()) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'user authentication failed'));
            res.status(401).send({
                code: 401,
                notify: true,
                type: 'error',
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'You are not logged in. Please reload page',
                disable: true,
                redirect: true,
                redirectPage: '/index'
            });
        }
    },

    addUserData: function (req, res, next) {
        var module = "addUserData";
        receivedLogger(module);
        userDB.findUserWithUniqueCuid(req.user.uniqueCuid, error, error, success);

        function success(userData) {
            if (req.customData) {
                req.customData.theUser = userData;
                consoleLogger(successLogger(module));
                next();
            } else {
                req.customData = {};
                req.customData.theUser = userData;
                consoleLogger(successLogger(module));
                next();
            }
        }

        function error(status, err) {
            //log the user out
            req.logout();

            consoleLogger(errorLogger(module, 'error retrieving user data', err));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error occurred while retrieving your personalized info. Please reload the page'
            });
        }
    },

    returnUserData: function (req, callback) {
        var module = "returnUserData";
        receivedLogger(module);
        userDB.findUserWithUniqueCuid(req.user.uniqueCuid, error, error, success);

        function success(userData) {
            consoleLogger(successLogger(module));
            callback(userData);
        }

        function error(status, err) {
            consoleLogger(errorLogger(module, 'error retrieving user data', err));
            callback(false);
        }
    },

    checkAccountStatus: function (req, res, next) {
        var module = "checkAccountStatus";
        receivedLogger(module);

        var theUser = getTheUser(req);

        if (theUser.isRegistered) {
            //checkApprovalStatus
            if (theUser.isApproved === false) {
                error();
            } else if (theUser.isBanned) {
                if (theUser.isBanned.status === true) {
                    //checking banned status
                    error();
                } else {
                    success();
                }
            } else {
                success();
            }
        } else {
            error();
        }

        function success() {
            consoleLogger(successLogger(module));
            next();
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.redirect('index');
        }

    },

    checkAccountStatusAngular: function (req, res, next) {
        var module = "checkAccountStatusAngular";
        receivedLogger(module);

        var theUser = getTheUser(req);

        if (theUser.isRegistered) {
            //checkApprovalStatus
            if (theUser.isApproved === false) {
                error("Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved.")
            } else if (theUser.isBanned) {
                if (theUser.isBanned.status === true) {
                    //checking banned status
                    error("Your have been banned from this service. Please contact the administrators for more information");
                } else {
                    success();
                }
            } else {
                success();
            }
        } else {
            error("You are not registered to use this website");
        }

        function success() {
            consoleLogger(successLogger(module));
            next();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage,
                redirect: true,
                redirectPage: '/index'
            });
        }

    },

    checkUserIsAdmin: function (req, res, next) {
        var module = "checkUserIsAdmin";
        receivedLogger(module);

        if (req.customData.theUser.isAdmin) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'User is not admin'));
            res.status(401).send({
                code: 401,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'Authorization required. Please reload page to log in'
            });
        }
    },

    checkUserIsAdminAndReturn: function (req, res, error, success) {
        var module = "checkUserIsAdminAndReturn";
        receivedLogger(module);

        userDB.findUserWithUniqueCuid(req.user.uniqueCuid, error_not_found, error_not_found, found);

        function found(userData) {
            if (req.customData) {
                req.customData.theUser = userData;
            } else {
                req.customData = {};
                req.customData.theUser = userData;
            }

            if (userData.isAdmin) {
                consoleLogger(successLogger(module, 'User is Admin'));
                success({
                    theUser: userData,
                    isAdmin: true
                });
            } else {
                consoleLogger(successLogger(module, 'User is NOT Admin'));
                success({
                    theUser: userData,
                    isAdmin: false
                });
            }
        }

        function error_not_found(status, err) {
            //log the user out
            req.logout();

            consoleLogger(errorLogger(module, 'error retrieving user data', err));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error occurred while retrieving your personalized info. Please reload the page'
            });

            error();
        }
    }
};