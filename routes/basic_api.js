var basic = require('../functions/basic.js');
var basic_handlers = require('../handlers/basic_handlers.js');
var userDB = require('../db/user_db.js');
var emailModule = require('../functions/email.js');

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
        var module = 'resendConfirmationEmail';
        receivedLogger(module);

        if (!emailModule.sendConfirmEmailLink(getTheUser(req))) {
            res.status(200).send({
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Email sent!'
            });
        } else {
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'success',
                msg: 'An error occurred. Please try again'
            });
        }
    }
};