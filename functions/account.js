var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var fs = require('fs');
var path = require('path');

var account = require('../functions/account.js');

var fileName = 'account.js';

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

    returnAccountStatusBanner: function (userData) {
        if (userData) {
            if (userData.isRegistered) {
                if (!userData.emailIsConfirmed) {
                    return {
                        show: true,
                        bannerClass: "alert alert-warning",
                        msg: "Please confirm your account by clicking the confirmation link we sent on your email. Please also check your spam folder",
                        showResendEmail: true,
                        accountStatus: false
                    };
                } else if (userData.isApproved === false) {
                    return {
                        show: true,
                        bannerClass: "alert alert-warning",
                        msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved.",
                        showResendEmail: false,
                        accountStatus: false
                    };
                } else if (userData.isBanned) {
                    if (userData.isBanned.status === true) {
                        //checking banned status
                        return {
                            show: true,
                            bannerClass: "alert alert-warning",
                            msg: "Your have been banned from this service. Please contact the administrators for more information",
                            showResendEmail: false,
                            accountStatus: false
                        };
                    } else {
                        return {
                            show: false,
                            bannerClass: "",
                            msg: "",
                            showResendEmail: false,
                            accountStatus: true
                        };
                    }
                } else {
                    return {
                        show: false,
                        bannerClass: "",
                        msg: "",
                        showResendEmail: false,
                        accountStatus: true
                    };
                }
            } else {
                return {
                    show: true,
                    bannerClass: "alert alert-warning",
                    msg: "You are not registered. Please reload this page",
                    showResendEmail: false,
                    accountStatus: false
                };
            }
        } else {
            return {
                show: false,
                bannerClass: "",
                msg: "",
                showResendEmail: false,
                accountStatus: true
            };
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
            req.session.destroy(function (err) {
                consoleLogger(errorLogger(module, 'error retrieving user data', err));
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'error',
                    msg: 'An error occurred while retrieving your personalized info. Please reload the page'
                });

                error();
            });
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