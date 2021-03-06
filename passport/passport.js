var fileName = 'passport.js';

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

var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;

function getTheUser(req) {
    return basic.getTheUser(req);
}

var cuid = require('cuid');
var userDB = require('../db/user_db.js');
var User = require("../database/users/user.js");
var bcrypt = require('bcrypt');
var forms = require('../functions/forms.js');

module.exports = function (passport, LocalStrategy) {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            var module = 'LocalStrategy';
            receivedLogger(module);

            forms.passportValidateUsernameAndPassword(username, password, validationDone);

            function validationDone(formValidationState) {
                if (formValidationState == 1) {
                    //this function BELOW returns a status of 1 if the user does not exist, and (-1,theUser) if the
                    //user exists
                    //else (-1,err) if there was an error while executing db operations
                    userDB.findUserWithUsername(username, errorDbUsername, errorDbUsername, successDbUsername);

                    function successDbUsername(status, theUser) {
                        if (status == -1) {

                            //means the user exists
                            bcrypt.compare(password, theUser.password, function (err, res) {
                                if (err) {

                                    consoleLogger(errorLogger(module, 'error when trying to comparing passwords', err));
                                    //syntax for done function: done(err, user, {additional info message});
                                    //if no err, use null, if no additional message, just return the first 2 fields
                                    //if no user, use false on user field
                                    return done(err, false, {
                                        msg: "A problem occurred when trying to log you in. Please try again"
                                    });

                                } else if (res) {

                                    //means the password checks with hash
                                    return done(null, theUser);

                                } else {

                                    //passwords don't check
                                    consoleLogger(errorLogger(module, 'Failed! Password is Incorrect'));
                                    return done(null, false, {
                                        msg: 'The password you entered is incorrect. Please try again'
                                    });

                                }

                            });

                        } else {

                            //means user does not exist(status here is 1, theUser is empty
                            consoleLogger(errorLogger(module, 'Failed! the account the user tried to sign in to was not found'));
                            done(null, false, {
                                msg: 'We could not find a registered user with the credentials you provided. Please check and try again'
                            });
                        }

                    }

                    function errorDbUsername(err) {
                        consoleLogger(errorLogger(module, 'Error while trying to find user'));
                        return done(err, false, {
                            msg: "A problem occurred when trying to log you in. Please try again"
                        });
                    }

                } else {
                    //form validation of the fields failed
                    consoleLogger(errorLogger(module, 'Failed! User local strategy authentication failed, username and(or) password required'));
                    done(null, false, {
                        msg: 'Username and(or) password required. Please try again'
                    });
                }
            }
        }));

    passport.serializeUser(function (user, done) {
        //only save the user uniqueCuid into the session to keep the data stored low
        done(null, user.uniqueCuid);
    });

    passport.deserializeUser(function (uniqueCuid, done) {
        //deserialize the saved uniqueCuid in session and find the user with the userId
        userDB.findUserWithUniqueCuid(uniqueCuid, error, error, success);

        function error(status) {
            if (status == -1 || status == 0) {
                done(null, false);
            }
        }

        function success(theUser) {
            done(null, theUser);
        }

    });
};