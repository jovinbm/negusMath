var path = require('path');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var middleware = require('../functions/middleware.js');

var templatesDir = path.join(__dirname, '../views/emails/my-templates');
var emailTemplates = require('email-templates');


var fileName = 'router.js';

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
    index_Html: function (req, res) {
        var module = 'index_Html';
        receivedLogger(module);

        var main = {
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };
        res.render('index/index.ejs', main);

    },

    renderHome_Html: function (req, res) {
        var module = 'renderHome_Html';
        receivedLogger(module);

        var main = {
            theUser: req.user,
            accountStatusBanner: middleware.returnAccountStatusBanner(req.user)
        };
        res.render('all/main.ejs', main);
    },

    renderEmail: function (req, res) {
        var module = 'renderEmail';
        receivedLogger(module);

        var temp = {
            firstName: 'NegusMath',
            lastName: 'User',
            email: ''
        };

        if (req.isAuthenticated()) {
            middleware.returnUserData(req, success);
        } else {
            success(temp);
        }


        function success(theUser) {

            //check that theUser is not false
            if (!theUser) {
                theUser = temp;
            }
            var templateGroup = req.params.templateGroup;

            emailTemplates(templatesDir, function (err, template) {
                if (err) {
                    consoleLogger(errorLogger(module, 'retrieving template directory', err));
                    res.status(500).send('An error has occurred. Please try again');
                } else {
                    var locals = {
                        email: theUser.email,
                        firstName: theUser.firstName,
                        lastName: theUser.lastName
                    };

                    template(templateGroup, locals, function (err, html, text) {
                        if (err) {
                            consoleLogger(errorLogger(module, 'error parsing email template/template not found. Sending not-found', err));
                            template('not-found', locals, function (err, html, text) {
                                if (err) {
                                    consoleLogger(errorLogger(module, 'error parsing email template/template not found', err));
                                    res.status(500).send('An error has occurred. Please try again');
                                } else {
                                    consoleLogger(successLogger(module, "sent not-found template due to error"));
                                    res.status(200).send(html);
                                }
                            });
                        } else {
                            consoleLogger(successLogger(module));
                            res.status(200).send(html);
                        }
                    });
                }
            })
        }
    }
};