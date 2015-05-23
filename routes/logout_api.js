var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var logout_handler = require('../handlers/logout_handlers.js');

var fileName = 'logout_api.js';

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
    logoutClient: function (req, res) {
        var module = 'logoutClient';
        receivedLogger(module);
        logout_handler.logoutClient(req, res);
    }
};