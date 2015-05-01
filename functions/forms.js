var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var path = require('path');

var fileName = 'forms_db.js';

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

var usernameRegex = /^[a-zA-Z0-9_]*$/;
var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
var passwordRegex = /^[a-zA-Z0-9_]*$/;
var noWhiteSpaceRegex = /\S/;

module.exports = {
    validateRegistrationForm: function (req, res, firstName, lastName, username, email, password1, password2, success) {
        var module = 'validateRegistrationForm';
        receivedLogger(module);
        var errors = 0;

        //check the firstName
        if (firstName.length > 30 && errors == 0) {
            consoleLogger("YES");
            error('First name should have at most 30 characters');
            ++errors;
        }
        if (firstName.length < 2 && errors == 0) {
            error('First name should have at least 2 characters');
            ++errors;
        }

        //check the lastName
        if (lastName.length > 30 && errors == 0) {
            ++errors;
            error('Last name should have at most 30 characters');
        }
        if (lastName.length < 2 && errors == 0) {
            ++errors;
            error('Last name should have at least 2 characters');
        }

        //check the username
        if (!(usernameRegex.test(username)) && errors == 0) {
            ++errors;
            error('Please enter a valid username. Only letters, numbers and underscores allowed');
        }
        if (username.length > 10 && errors == 0) {
            ++errors;
            error('Username should have at most 10 characters');
        }
        if (username.length < 4 && errors == 0) {
            ++errors;
            error('Username should have at least 2 characters');
        }

        //check the email
        if (!(emailRegex.test(email)) && errors == 0) {
            ++errors;
            error('Please enter a valid email');
        }

        //check passwords
        if (!(passwordRegex.test(password1)) && errors == 0) {
            ++errors;
            error('Please enter a valid password. Only letters, numbers and underscores allowed');
        }
        if ((password1 != password2) && errors == 0) {
            ++errors;
            error("The passwords you entered don't match");
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validateUsername: function (req, res, username, success) {
        var module = 'validateUsername';
        receivedLogger(module);
        var errors = 0;

        //check the username
        if (!(usernameRegex.test(username)) && errors == 0) {
            ++errors;
            error('Please enter a valid username. Only letters, numbers and underscores allowed');
        }
        if (username.length > 10 && errors == 0) {
            ++errors;
            error('Username should have at most 10 characters');
        }
        if (username.length < 4 && errors == 0) {
            ++errors;
            error('Username should have at least 4 characters');
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validatePassword: function (req, res, password, success) {
        var module = 'validatePassword';
        receivedLogger(module);
        var errors = 0;

        //check passwords
        if (!(passwordRegex.test(password)) && errors == 0) {
            ++errors;
            error('Please enter a valid password. Only letters, numbers and underscores allowed');
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validateContactUs: function (req, res, email, message, success) {
        var module = 'validateContactUs';
        receivedLogger(module);
        var errors = 0;

        //check the email
        if (!(emailRegex.test(email)) && errors == 0) {
            ++errors;
            error('Please enter a valid email');
        }

        if (message && errors == 0) {
            if (message.length == 0) {
                ++errors;
                error('Please enter a message');
            }
        } else {
            ++errors;
            error('Please enter a message');
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    passportValidateUsernameAndPassword: function (username, password) {
        var module = 'passportValidateUsernameAndPassword';
        receivedLogger(module);
        //this function does not respond to the request itself, rather it returns a status of 1 or -1
        var errors = 0;

        //check the username
        if (!(usernameRegex.test(username)) && errors == 0) {
            ++errors;
            error('Please enter a valid username. Only letters, numbers and underscores allowed');
        }
        if (username.length > 10 && errors == 0) {
            ++errors;
            error('Username should have at most 10 characters');
        }
        if (username.length < 4 && errors == 0) {
            ++errors;
            error('Username should have at least 4 characters');
        }

        //check passwords
        if (!(passwordRegex.test(password)) && errors == 0) {
            ++errors;
            error('Please enter a valid password. Only letters, numbers and underscores allowed');
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            return 1;
        } else {
            consoleLogger(errorLogger(module));
            return -1;
        }
    },

    validateNewPost: function (req, res, theNewPost, success) {
        var module = 'validateNewPost';
        receivedLogger(module);
        var errors = 0;

        //validate heading
        //check that at least at least one character is non-whitespace
        if (!(noWhiteSpaceRegex.test(theNewPost.postHeading)) && errors == 0) {
            ++errors;
            error('Heading does not seem to be right. Please check and try again');
        }

        if (theNewPost.postHeading.length == 0 && errors == 0) {
            ++errors;
            error('The heading cannot be empty');
        }

        //validate content
        //check that at least at least one character is non-whitespace
        if (!(noWhiteSpaceRegex.test(theNewPost.postContent)) && errors == 0) {
            ++errors;
            error('The post content does not seem to be right. Please check and try again');
        }

        if (theNewPost.postContent.length == 0 && errors == 0) {
            ++errors;
            error('The post content cannot be empty');
        }

        //validate summary
        //check that at least at least one character is non-whitespace
        if (!(noWhiteSpaceRegex.test(theNewPost.postSummary)) && errors == 0) {
            ++errors;
            error('The post summary does not seem to be right. Please check and try again');
        }

        if (theNewPost.postSummary.length == 0 && errors == 0) {
            ++errors;
            error('The post content cannot be empty');
        }

        if (theNewPost.postSummary.length > 1600 && errors == 0) {
            ++errors;
            error('The post summary cannot be more than 1600 characters');
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            success();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                newPostBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    }
};