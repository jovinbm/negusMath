var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var user_handler = require('../handlers/user_handlers.js');
var userDB = require('../db/user_db.js');

var fileName = 'upload_api.js';

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
    upload: function (req, res) {
        consoleLogger(JSON.stringify(req.body));
        consoleLogger(JSON.stringify(req.files));

        res.status(200).send({
            fileData: req.files.file
        });
    }
};
