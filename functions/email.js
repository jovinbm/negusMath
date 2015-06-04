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
        var module = 'sendWelcomeEmail';
        receivedLogger(module);
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
                            lastName: theUser.lastName,
                            emailConfirmLink: 'http://www.negusmath.com/confirm_email/' + theUser.hashedUniqueCuid
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

    sendConfirmEmailLink: function (theUser) {
        var module = 'sendConfirmEmailLink';
        receivedLogger(module);
        emailTemplates(templatesDir, function (err, template) {
            if (err) {
                consoleLogger(errorLogger(module, 'error sending email', err));
                return false;
            } else {
                //only send if theUser exists
                if (theUser) {
                    if (theUser.email) {
                        var locals = {
                            email: theUser.email,
                            firstName: theUser.firstName,
                            lastName: theUser.lastName,
                            emailConfirmLink: 'http://www.negusmath.com/confirm_email/' + theUser.hashedUniqueCuid
                        };

                        template('confirm-email', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                                return false;
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'Confirm your email',
                                    html: html
                                }, function (err, responseStatus) {
                                    if (err) {
                                        consoleLogger(errorLogger(module, 'error sending email', err));
                                        return false;
                                    } else {
                                        consoleLogger(successLogger(module));
                                        return true;
                                    }
                                });
                            }
                        });
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        });
    },

    sendAddedAdminPrivilegesEmail: function (theUser) {
        var module = 'sendAddedAdminPrivilegesEmail';
        receivedLogger(module);
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

                        template('added-admin-privileges', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'Your are now an admin at NegusMath!',
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

    sendRemovedAdminPrivilegesEmail: function (theUser) {
        var module = 'sendRemovedAdminPrivilegesEmail';
        receivedLogger(module);
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

                        template('removed-admin-privileges', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'You are no longer an Admin at NegusMath',
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
        var module = 'sendAccountApprovedEmail';
        receivedLogger(module);
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
                                    subject: 'Your NegusMath account is now active!',
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

    sendAccountBannedEmail: function (theUser) {
        var module = 'sendAccountBannedEmail';
        receivedLogger(module);
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

                        template('account-banned', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'Your have been banned from NegusMath!',
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

    sendAccountUnBannedEmail: function (theUser) {
        var module = 'sendAccountUnBannedEmail';
        receivedLogger(module);
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

                        template('account-banned', locals, function (err, html, text) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error sending email', err));
                            } else {
                                transporter.sendMail({
                                    from: 'NegusMath Admin <admin@mg.negusmath.com>',
                                    to: locals.email,
                                    subject: 'Your NegusMath account has been reactivated!',
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
        var module = 'contactUs';
        receivedLogger(module);
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
                path: path.join(__dirname, "../views/all/emails/contact_us_reply.html")
            }
        });
    }
};