var path = require('path');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var middleware = require('../functions/middleware.js');

var fileName = 'router.js';

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
    index_Html: function (req, res) {
        var module = 'index_Html';
        receivedLogger(module);

        res.render('index/index.ejs');
    },

    renderHome_Html: function (req, res) {
        var module = 'renderHome_Html';
        receivedLogger(module);

        if (req.isAuthenticated()) {
            //gets user details from checkIfUserIsAdminReturn middleware which calls success with an
            //object with 3 keys: 'success' = boolean, true if succeded, 'userdata' and
            //'isAdmin'
            middleware.checkUserIsAdminAndReturn(req, res, error, success);

            function success(details) {
                if (details.isAdmin) {
                    res.render('admin/adminHome.ejs');
                    consoleLogger(successLogger(module));
                } else {
                    res.render('client/clientHome.ejs');
                    consoleLogger(successLogger(module));
                }
            }

            function error() {
                consoleLogger(errorLogger(module));
            }

        } else {
            res.render('client/clientHome.ejs');
            consoleLogger(successLogger(module));
        }

    },

    adminHome_Html: function (req, res) {
        var module = 'adminHome_Html';
        receivedLogger(module);

        res.render('admin/adminHome.ejs');
    }
};