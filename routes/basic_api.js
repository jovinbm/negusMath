var basic = require('../functions/basic.js');
var basic_handlers = require('../handlers/basic_handlers.js');
var userDB = require('../db/user_db.js');
var emailModule = require('../functions/email.js');
var account = require('../functions/account.js');
var middleware = require('../functions/middleware.js');

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
    return basic.getTheUser(req);
}


module.exports = {
    confirmEmail: function (req, res) {
        var account = require('../functions/account.js');
        var middleware = require('../functions/middleware.js');
        var module = 'confirmEmail';
        receivedLogger(module);

        var theHashedUniqueCuid;
        if (req.params.hashedUniqueCuid) {
            theHashedUniqueCuid = req.params.hashedUniqueCuid;
        } else {
            theHashedUniqueCuid = 12345;
        }

        basic_handlers.confirmEmail(req, res, theHashedUniqueCuid);
    },

    resendConfirmationEmail: function (req, res) {
        var account = require('../functions/account.js');
        var middleware = require('../functions/middleware.js');
        var module = 'resendConfirmationEmail';
        receivedLogger(module);

        if (req.body.userUniqueCuid) {
            var userUniqueCuid = req.body.userUniqueCuid;
            account.returnUserWithUniqueCuid(userUniqueCuid, success);

            //success will be called with false in case of error
            function success(theUser) {
                if (theUser) {
                    basic_handlers.resendConfirmationEmail(req, res, theUser);
                } else {
                    error();
                }
            }
        } else {
            error();
        }

        function error() {
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'success',
                msg: 'An error occurred. Please try again'
            });
        }
    }
};