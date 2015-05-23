var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var emailModule = require('../functions/email.js');

var fileName = 'logout_handlers.js';

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

    logoutClient: function (req, res) {
        var module = 'logoutClient';
        receivedLogger(module);

        req.logout();
        consoleLogger(successLogger(module));
        res.status(200).send({
            code: 200,
            redirect: true,
            redirectPage: "/index"
        });
    }
};