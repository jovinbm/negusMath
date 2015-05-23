var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var path = require('path');
var templatesDir = path.join(__dirname, '../views/emails/my-templates');
var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: "Mailgun",
    auth: {
        user: 'postmaster@mg.negusmath.com',
        pass: 'd5a4a0a325a8c9a5903cc6ab1cf74be2'
    }
});

var fileName = 'email.js';

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
    sendWelcomeEmail: function (theUser) {
        emailTemplates(templatesDir, function (err, template) {
            if (err) {
                consoleLogger(errorLogger(module, 'error sending email', err));
            } else {
                //only send if theUser exists
                if (theUser) {
                    if (theUser.email) {
                        var locals = {
                            email: theUser.email,
                            firstName: theUser.firstName,
                            lastName: theUser.lastName
                        };

                        template('welcome-email', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'Welcome to NegusMath!',
                                    html: html
                                }, function (err, responseStatus) {
                                    if (err) {
                                        consoleLogger(errorLogger(module, 'error sending email', err));
                                    } else {
                                        consoleLogger(successLogger(module, responseStatus.message));
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    },

    sendAccountApprovedEmail: function (theUser) {
        emailTemplates(templatesDir, function (err, template) {
            if (err) {
                consoleLogger(errorLogger(module, 'error sending email', err));
            } else {
                //only send if theUser exists
                if (theUser) {
                    if (theUser.email) {
                        var locals = {
                            email: theUser.email,
                            firstName: theUser.firstName,
                            lastName: theUser.lastName
                        };

                        template('account-approved', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'Welcome to NegusMath!',
                                    html: html
                                }, function (err, responseStatus) {
                                    if (err) {
                                        consoleLogger(errorLogger(module, 'error sending email', err));
                                    } else {
                                        consoleLogger(successLogger(module, responseStatus.message));
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    },

    contactUs: function (userEmail, message) {
        //send email to admin
        transporter.sendMail({
            from: userEmail,
            to: 'contact-us@mg.harvardgrill.com',
            text: message
        });

        //send confirmation email to user
        transporter.sendMail({
            from: '"HarvardGrill" <admin@mg.harvardgrill.com>',
            to: userEmail,
            subject: 'We have received your message',
            html: {
                path: path.join(__dirname, "../views/admin/emails/contact_us_reply.html")
            }
        });
    }
};