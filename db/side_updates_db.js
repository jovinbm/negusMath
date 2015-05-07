var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var User = require("../database/users/user.js");
var Post = require("../database/posts/post.js");
var bcrypt = require('bcrypt');
var cuid = require('cuid');

var fileName = 'side_updates_db.js';

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
    updateNumberOfVisits: function (postIndex, error_neg_1, error_0, success) {
        var module = 'updateNumberOfVisits';
        receivedLogger(module);
        Post.update({
                postIndex: postIndex
            },
            {
                $inc: {
                    numberOfVisits: 1
                }
            })
            .exec(function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            })
    }
};
