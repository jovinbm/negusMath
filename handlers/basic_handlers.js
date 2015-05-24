var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var postDB = require('../db/post_db.js');
var userDB = require('../db/user_db.js');
var sideUpdates = require('../db/side_updates_db.js');
var emailModule = require('../functions/email.js');

var fileName = 'basic_handlers.js';

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
    confirmEmail: function (req, res, hashedUniqueCuid) {
        var module = "confirmEmail";
        receivedLogger(module);

        userDB.confirmEmail(hashedUniqueCuid, error, error, success);
        function success(status) {
            consoleLogger(successLogger(module));
            res.render('emails/my-templates/after-email-confirm-status/html.ejs', status);
        }

        function error(status) {
            consoleLogger(errorLogger(module));
            res.render('emails/my-templates/after-email-confirm-status/html.ejs', status);
        }
    },

    resendConfirmationEmail: function (req, res, theUser) {
        var module = 'resendConfirmationEmail';
        receivedLogger(module);

        if (!emailModule.sendConfirmEmailLink(theUser)) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                code: 200,
                notify: true,
                type: 'success',
                msg: 'Email sent!'
            });
        } else {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'success',
                msg: 'An error occurred. Please try again'
            });
        }
    }
};