var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var fs = require('fs');
var path = require('path');

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

        if (req.user) {
            if (req.customData) {
                req.customData.theUser = req.user;
                consoleLogger(successLogger(module));
                next();
            } else {
                req.customData = {};
                req.customData.theUser = req.user;
                consoleLogger(successLogger(module));
                next();
            }
        } else {
            //log the user out
            req.logout();

            consoleLogger(errorLogger(module, 'error retrieving user data from req object', err));
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

    returnUserWithUniqueCuid: function (userUniqueCuid, callback) {
        var module = "returnUserWithUniqueCuid";
        receivedLogger(module);
        userDB.findUserWithUniqueCuid(userUniqueCuid, error, error, success);

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

        if (theUser) {
            if (theUser.isRegistered && theUser.emailIsConfirmed && theUser.isApproved && !theUser.isBanned.status) {
                success();
            } else {
                error();
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

        if (theUser) {
            if (theUser.isRegistered) {
                if (theUser.emailIsConfirmed == false) {
                    error("Please confirm your account by clicking the confirmation link we sent on your email. Please also check your spam folder");
                } else if (theUser.isApproved === false) {
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
        } else {
            error("We could not find your records. Please reload page. If problem persists contact us for more informatiuon")
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
    },

    getHumanReadableFileSize: function (sizeInBytes) {
        var module = 'getHumanReadableFileSize';
        receivedLogger(module);
        var sizes = {
            TB: 1099511627776,
            GB: 1073741824,
            MB: 1048576,
            KB: 1024
        };
        var ext = "";
        var divider = "";
        if (sizeInBytes > sizes.TB) {
            ext = "TB";
            divider = sizes.TB;
        } else if (sizeInBytes > sizes.GB) {
            ext = "GB";
            divider = sizes.GB;
        } else if (sizeInBytes > sizes.MB) {
            ext = "MB";
            divider = sizes.MB;
        } else if (sizeInBytes > sizes.KB) {
            ext = "KB";
            divider = sizes.KB;
        } else {
            ext = "bytes";
            divider = 1;
        }

        consoleLogger(successLogger(module));
        return (sizeInBytes / divider) + " " + ext;
    },

    deleteFile: function (pathFromRoot, error_neg_1, success) {
        var module = 'deleteFile';
        receivedLogger(module);

        var theFullPath = path.join(__dirname, '../', pathFromRoot);
        fs.exists(theFullPath, function (exists) {
            if (exists) {
                fs.unlink(theFullPath, callback);
                function callback(err) {
                    if (err) {
                        consoleLogger(errorLogger(module, err));
                        error_neg_1();
                    } else {
                        consoleLogger(successLogger(module));
                        success();
                    }
                }
            } else {
                //file already deleted
                consoleLogger(successLogger(module));
                success();
            }
        });
    }
};