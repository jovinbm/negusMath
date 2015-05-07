var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var User = require("../database/users/user.js");
var bcrypt = require('bcrypt');
var sideUpdates = require('./side_updates_db.js');

var fileName = 'user_db.js';

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

    findUserWithUniqueCuid: function (uniqueCuid, error_neg_1, error_0, success) {
        var module = 'findUserWithUniqueCuid';
        receivedLogger(module);
        User.findOne({uniqueCuid: uniqueCuid}, {}).exec(
            function (err, theUser) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (theUser == null || theUser == undefined) {
                    consoleLogger(successLogger(module, "No user found with the given uniqueCuid"));
                    error_0(0, err);
                } else {
                    consoleLogger(successLogger(module));
                    success(theUser);
                }
            }
        );
    },

    findUserWithUsername: function (username, error_neg_1, error_0, success) {
        var module = 'findUserWithUsername';
        receivedLogger(module);
        User.findOne({username: username}).exec(
            function (err, theUser) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (theUser == null || theUser == undefined) {
                    consoleLogger(successLogger(module, "No user found with the given username"));
                    success(1, theUser);
                } else {
                    consoleLogger(successLogger(module));
                    success(-1, theUser);
                }
            }
        );
    },

    checkUserPassword: function (uniqueCuid, password, error_neg_1, errorPasswordBcrypt, success) {
        var module = 'checkUserPassword';
        receivedLogger(module);
        User.findOne({uniqueCuid: uniqueCuid}).exec(
            function (err, theUser) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (theUser == null || theUser == undefined) {
                    consoleLogger(successLogger(module, "No user found with the given uniqueCuid"));
                    error_neg_1(0, err);
                } else {
                    bcrypt.compare(password, theUser.password, function (err, res) {
                        consoleLogger(res);
                        if (err) {
                            consoleLogger(errorLogger(module, 'error comparing passwords', err));
                            errorPasswordBcrypt(err);
                        } else if (res) {
                            consoleLogger(successLogger(module));
                            //means the password checks with hash
                            success(1);
                        } else {
                            consoleLogger(successLogger(module));
                            //passwords don't check
                            success(-1);
                        }
                    });
                }
            }
        );
    },


    saveUser: function (theUserObject, error_neg_1, error_0, success) {
        var module = 'saveUser';
        receivedLogger(module);
        theUserObject.save(function (err, theSavedUser) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else {
                consoleLogger(successLogger(module));
                success(theSavedUser);
            }
        });
    },

    deleteUser: function (theUser, error_neg_1, error_0, success) {
        var module = 'deleteUser';
        receivedLogger(module);
        User.
            find({uniqueCuid: theUser.uniqueCuid})
            .remove()
            .exec(function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            })
    },

    updateFullName: function (uniqueCuid, fullName, error_neg_1, error_0, success) {
        var module = 'updateFullName';
        receivedLogger(module);
        User
            .update({
                uniqueCuid: uniqueCuid
            }, {
                $set: {
                    fullName: fullName
                }
            }, function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            }
        )
    },

    updateUsername: function (uniqueCuid, username, error_neg_1, error_0, success) {
        var module = 'updateUsername';
        receivedLogger(module);
        User
            .update({
                uniqueCuid: uniqueCuid
            }, {
                $set: {
                    username: username
                }
            }, function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            }
        )
    },

    updateEmail: function (uniqueCuid, email, error_neg_1, error_0, success) {
        var module = 'updateEmail';
        receivedLogger(module);
        User
            .update({
                uniqueCuid: uniqueCuid
            }, {
                $set: {
                    email: email
                }
            }, function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            }
        )
    },


    updatePassword: function (uniqueCuid, passwordHash, error_neg_1, error_0, success) {
        var module = 'updatePassword';
        receivedLogger(module);
        User
            .update({
                uniqueCuid: uniqueCuid
            }, {
                $set: {
                    password: passwordHash
                }
            }, function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            }
        )
    }

};