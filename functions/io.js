var app = require('../app.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;

var fileName = 'io.js';

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

    //this function emits an event to the respective user
    emitToOne: function (socketRoom, serverEvent, content, success) {
        app.io.sockets.in(socketRoom).emit(serverEvent, content);
        if (success) {
            success();
        }
    },


    //this function emits an event to all connected users
    emitToAll: function (serverEvent, content, success) {
        app.io.emit(serverEvent, content);
        if (success) {
            success();
        }
    }

};