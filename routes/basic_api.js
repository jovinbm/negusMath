var email = require("emailjs");
var basic = require('../functions/basic.js');
var basic_handlers = require('../handlers/basic_handlers.js');
var userDB = require('../db/user_db.js');

var fileName = 'basic_api.js';

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

    startUp: function (req, res) {
        basic.consoleLogger('STARTUP event received');
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'readyPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: readyPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                basic_handlers.startUp(req, res, theUser);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    },


    reconnect: function (req, res) {
        basic.consoleLogger('RECONNECT event received');
        var page = req.body.page;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'reconnectPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: reconnectPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                basic_handlers.reconnect(req, res, theUser, page);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    }
};