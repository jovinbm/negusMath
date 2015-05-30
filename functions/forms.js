var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var multer = require('multer');
var middleware = require('../functions/middleware.js');

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
    return basic.getTheUser(req);
}

var usernameRegex = /^[a-zA-Z0-9_]*$/;
var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
var passwordRegex = /^[a-zA-Z0-9_]*$/;
var noWhiteSpaceRegex = /\S/;

module.exports = {
    validateRegistrationForm: function (req, res, firstName, lastName, username, email, password1, password2, invitationCode, success) {
        var module = 'validateRegistrationForm';
        receivedLogger(module);
        var errors = 0;

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //check the firstName
        if (errors == 0) {
            if (firstName.length > 30) {
                consoleLogger("YES");
                error('First name should have at most 30 characters');
                ++errors;
            }
        }

        if (errors == 0) {
            if (firstName.length < 2) {
                error('First name should have at least 2 characters');
                ++errors;
            }
        }

        //check the lastName
        if (errors == 0) {
            if (lastName.length > 30) {
                ++errors;
                error('Last name should have at most 30 characters');
            }
        }

        if (errors == 0) {
            if (lastName.length < 2) {
                ++errors;
                error('Last name should have at least 2 characters');
            }
        }

        //check the username
        if (errors == 0) {
            if (!(usernameRegex.test(username))) {
                ++errors;
                error('Please enter a valid username. Only letters, numbers and underscores allowed');
            }
        }

        if (errors == 0) {
            if (username.length > 10) {
                ++errors;
                error('Username should have at most 10 characters');
            }
        }

        if (errors == 0) {
            if (username.length < 4) {
                ++errors;
                error('Username should have at least 2 characters');
            }
        }

        //check the email
        if (errors == 0) {
            if (!(emailRegex.test(email))) {
                ++errors;
                error('Please enter a valid email');
            }
        }

        //check passwords
        if (errors == 0) {
            if (!(passwordRegex.test(password1))) {
                ++errors;
                error('Please enter a valid password. Only letters, numbers and underscores allowed');
            }
        }

        if (errors == 0) {
            if ((password1 != password2)) {
                ++errors;
                error("The passwords you entered don't match");
            }
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

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //check the username
        if (errors == 0) {
            if (!(usernameRegex.test(username))) {
                ++errors;
                error('Please enter a valid username. Only letters, numbers and underscores allowed');
            }
        }

        if (errors == 0) {
            if (username.length > 10) {
                ++errors;
                error('Username should have at most 10 characters');
            }
        }

        if (errors == 0) {
            if (username.length < 4) {
                ++errors;
                error('Username should have at least 4 characters');
            }
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

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //check passwords
        if (errors == 0) {
            if (!(passwordRegex.test(password))) {
                ++errors;
                error('Please enter a valid password. Only letters, numbers and underscores allowed');
            }
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

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //check the email
        if (errors == 0) {
            if (!(emailRegex.test(email))) {
                ++errors;
                error('Please enter a valid email');
            }
        }

        if (errors == 0) {
            if (message) {
                if (message.length == 0) {
                    ++errors;
                    error('Please enter a message');
                }
            } else {
                ++errors;
                error('Please enter a message');
            }
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

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //check the username
        if (errors == 0) {
            if (!(usernameRegex.test(username))) {
                ++errors;
                error('Please enter a valid username. Only letters, numbers and underscores allowed');
            }
        }

        if (errors == 0) {
            if (username.length > 10) {
                ++errors;
                error('Username should have at most 10 characters');
            }
        }

        if (errors == 0) {
            if (username.length < 4) {
                ++errors;
                error('Username should have at least 4 characters');
            }
        }

        //check passwords
        if (errors == 0) {
            if (!(passwordRegex.test(password))) {
                ++errors;
                error('Please enter a valid password. Only letters, numbers and underscores allowed');
            }
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

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //validate that the post is not null
        if (errors == 0) {
            if ((theNewPost == null || theNewPost == undefined)) {
                ++errors;
                error('Missing post');
            }
        }

        //check that all fields in the new post are available

        //validate heading
        if (errors == 0) {
            if ((theNewPost.postHeading == null || theNewPost.postHeading == undefined)) {
                ++errors;
                error('Missing heading field');
            }
        }

        //check that at least at least one character is non-whitespace
        if (errors == 0) {
            if (!(noWhiteSpaceRegex.test(theNewPost.postHeading))) {
                ++errors;
                error('Heading does not seem to be right. Please check and try again');
            }
        }

        if (errors == 0) {
            if (theNewPost.postHeading.length == 0) {
                ++errors;
                error('The heading cannot be empty');
            }
        }

        //validate content
        if (errors == 0) {
            if ((theNewPost.postContent == null || theNewPost.postContent == undefined)) {
                ++errors;
                error('Missing content field');
            }
        }

        var postContent = cheerio(theNewPost.postContent).text();

        //check that at least at least one character is non-whitespace
        if (errors == 0) {
            if (!(noWhiteSpaceRegex.test(postContent))) {
                ++errors;
                error('The post content does not seem to be right. Please check and try again');
            }
        }

        if (errors == 0) {
            if (postContent.length == 0) {
                ++errors;
                error('The post content cannot be empty');
            }
        }

        //validate summary
        if (errors == 0) {
            if ((theNewPost.postSummary == null || theNewPost.postSummary == undefined)) {
                ++errors;
                error('Missing summary field');
            }
        }

        var postSummary = cheerio(theNewPost.postSummary).text();

        //check that at least at least one character is non-whitespace
        if (errors == 0) {
            if (!(noWhiteSpaceRegex.test(theNewPost.postSummary))) {
                ++errors;
                error('The post summary does not seem to be right. Please check and try again');
            }
        }

        if (errors == 0) {
            if (postSummary.length == 0) {
                ++errors;
                error('The post summary cannot be empty');
            }
        }

        if (errors == 0) {
            if (postSummary.length > 2000) {
                ++errors;
                error('The post summary cannot exceed 2000 characters');
            }
        }

        //validate tags
        if (errors == 0) {
            if ((theNewPost.postTags == null || theNewPost.postTags == undefined) && errors == 0) {
                ++errors;
                error('Missing postTags field');
            }

            if (errors == 0) {
                var tags = theNewPost.postTags;
                var numberOfTags = 0;
                tags.forEach(function (tag) {
                    numberOfTags++;
                    if (errors == 0) {
                        if (tag.text.length < 3 && errors == 0) {
                            errors++;
                            error('Minimum allowed length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30 && errors == 0) {
                            errors++;
                            error('Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5 && errors == 0) {
                    errors++;
                    error('Only a maximum of 10 tags are allowed per post');
                }
            }
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            success();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validateMainSearchQuery: function (req, res, queryString, success) {
        var module = 'validateMainSearchQuery';
        receivedLogger(module);
        var errors = 0;

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //validate query no whitespace
        //check that at least at least one character is non-whitespace
        if (errors == 0) {
            if (!(noWhiteSpaceRegex.test(queryString))) {
                ++errors;
                error('The search cannot be empty');
            }
        }

        if (errors == 0) {
            if (queryString.length == 0 && errors == 0) {
                ++errors;
                error('The search cannot be empty');
            }
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
    },

    checkFileIsImage: function (req, res, file, callback) {
        var module = 'checkFileIsImage';
        receivedLogger(module);
        var errors = 0;

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //file type
        if (errors == 0) {
            if (!(file.mimetype.indexOf('image') > -1)) {
                ++errors;
                error('Please upload a valid image file');
            }
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            callback();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: errorMessage
            });

            //file is not image, remove it
            middleware.deleteFile(file.path, error_deleting, removed);
            function removed() {
                consoleLogger(successLogger(module, "file successfully removed from filesystem"));
            }

            function error_deleting() {
                consoleLogger(errorLogger(module, "file not removed from file system"));
            }
        }
    },

    checkFileIsPdf: function (req, res, file, callback) {
        var module = 'checkFileIsPdf';
        receivedLogger(module);
        var errors = 0;

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //file type
        if (errors == 0) {
            if (!(file.mimetype.indexOf('pdf') > -1)) {
                ++errors;
                error('Please upload a valid pdf file');
            }
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            callback();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: errorMessage
            });

            //file is not image, remove it
            middleware.deleteFile(file.path, error_deleting, removed);
            function removed() {
                consoleLogger(successLogger(module, "file successfully removed from filesystem"));
            }

            function error_deleting() {
                consoleLogger(errorLogger(module, "file not removed from file system"));
            }
        }
    },

    checkFileIsZip: function (req, res, file, callback) {
        var module = 'checkFileIsZip';
        receivedLogger(module);
        var errors = 0;

        //check that all arguments exist i.e. all fields are not null
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (errors == 0) {
                if (arguments[i] == null || arguments[i] == undefined) {
                    errors++;
                    error('An error occurred. Some fields missing. Please try again');
                }
            }
        }

        //file type
        if (errors == 0) {
            if (!(file.mimetype.indexOf('zip') > -1)) {
                ++errors;
                error('Please upload a valid zip file');
            }
        }

        if (errors == 0) {
            consoleLogger(successLogger(module));
            callback();
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: errorMessage
            });

            //file is not image, remove it
            middleware.deleteFile(file.path, error_deleting, removed);
            function removed() {
                consoleLogger(successLogger(module, "file successfully removed from filesystem"));
            }

            function error_deleting() {
                consoleLogger(errorLogger(module, "file not removed from file system"));
            }
        }
    }
};