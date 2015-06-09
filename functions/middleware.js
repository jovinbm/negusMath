var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var fs = require('fs');
var path = require('path');

var routes = require('../routes/router.js');

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

function getFullQueryWithQMark(req) {
    if (req.originalUrl) {
        if (req.originalUrl.indexOf('?') != -1) {
            return req.originalUrl.substr(req.originalUrl.indexOf('?'));
        } else {
            return '?'
        }
    } else {
        return '?'
    }
}

module.exports = {

    addLastPage: function (req, res, next) {
        var module = "addLastPage";
        receivedLogger(module);

        if (req.session) {
            switch (req.route.path) {
                case "/partial/posts":
                    req.session.lastPage = '/posts' + getFullQueryWithQMark(req);
                    break;
                case "/partial/search/posts":
                    req.session.lastPage = '/search/posts' + getFullQueryWithQMark(req);
                    break;
                default:
                    req.session.lastPage = req.originalUrl;
            }
        }
        console.log('********************* ' + req.session.lastPage);
        next();
    },

    //authenticates requests
    ensureAuthenticated: function (req, res, next) {
        var module = "ensureAuthenticated";
        receivedLogger(module);

        if (req.isAuthenticated()) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'user authentication failed'));
            routes.render_not_logged_in(req, res);
        }
    },

    ensureAuthenticatedXhr: function (req, res, next) {
        var module = "ensureAuthenticatedXhr";
        receivedLogger(module);
        if (req.isAuthenticated()) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'user authentication failed'));
            res.status(401).send({
                code: 401,
                dialog: true,
                id: 'sign-in',
                msg: 'You are not logged in. Please reload page'
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
            req.session.destroy(function (err) {
                consoleLogger(errorLogger(module, 'error retrieving user data from req object', err));
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'error',
                    msg: 'An error occurred while retrieving your personalized info. Please reload the page'
                });
            });
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
            routes.render_not_authorized_access_page(req, res);
        }

    },

    checkAccountStatusXhr: function (req, res, next) {
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
            error("We could not find your records. Please reload page. If problem persists contact us for more information")
        }

        function success() {
            consoleLogger(successLogger(module));
            next();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                dialog: true,
                id: 'not-authorized',
                msg: errorMessage
            });
        }

    },

    checkUserIsAdmin: function (req, res, next) {
        var module = "checkUserIsAdminXhr";
        receivedLogger(module);

        if (req.customData.theUser.isAdmin) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'User is not admin'));
            routes.render_not_authorized_access_page(req, res);
        }
    },

    checkUserIsAdminXhr: function (req, res, next) {
        var module = "checkUserIsAdmin";
        receivedLogger(module);

        if (req.customData.theUser.isAdmin) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'User is not admin'));
            //res.status(401).send({
            //    code: 401,
            //    dialog: true,
            //    id: 'not-authorized',
            //    msg: 'You are not authorized to access this page/feature.'
            //});

            res.status(401).send({
                code: 401,
                dialog: true,
                id: 'sign-in',
                msg: 'You are not logged in. Please reload page'
            });
        }
    }
};