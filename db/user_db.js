var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var User = require("../database/users/user.js");
var bcrypt = require('bcrypt');

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
    return basic.getTheUser(req);
}

function countAllUsers(error_neg_1, error_0, success) {
    var module = 'countAllUsers';
    receivedLogger(module);
    User.count({}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
}

function countAdminUsers(error_neg_1, error_0, success) {
    var module = 'countAdminUsers';
    receivedLogger(module);
    User.count({isAdmin: true}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
}

function countLocalUsers(error_neg_1, error_0, success) {
    var module = 'countLocalUsers';
    receivedLogger(module);
    User.count({isAdmin: false}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
}

function countApprovedUsers(error_neg_1, error_0, success) {
    var module = 'countApprovedUsers';
    receivedLogger(module);
    User.count({isApproved: true}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
}

function countUsersNotApproved(error_neg_1, error_0, success) {
    var module = 'countUsersNotApproved';
    receivedLogger(module);
    User.count({isApproved: false}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
}

function countBannedUsers(error_neg_1, error_0, success) {
    var module = 'countBannedUsers';
    receivedLogger(module);
    User.count({"isBanned.status": true}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
}

function countUsersNotBanned(error_neg_1, error_0, success) {
    var module = 'countUsersNotBanned';
    receivedLogger(module);
    User.count({"isBanned.status": false}, function (err, total) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1, err);
        } else {
            consoleLogger(successLogger(module));
            success(total);
        }
    })
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
    },

    confirmEmail: function (hashedUniqueCuid, error_neg_1, error_0, success) {
        var module = 'confirmEmail';
        receivedLogger(module);
        User.findOne({hashedUniqueCuid: hashedUniqueCuid}, function (err, user) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1({
                    confirmed: false,
                    theUser: null,
                    showBanner: true,
                    bannerClass: 'alert alert-warning',
                    msg: 'There was a problem confirming your email. Please try again'
                });
            } else if (user == null || user == undefined || user.length == 0) {
                consoleLogger(successLogger(module, "Could not find the user with the given hashedUniqueCuid"));
                error_0({
                    confirmed: false,
                    theUser: null,
                    showBanner: true,
                    bannerClass: 'alert alert-warning',
                    msg: 'We could not find a user with your credentials in our records. Please try again or create a new account'
                });
            } else {
                if (user.emailIsConfirmed === false) {
                    user.emailIsConfirmed = true;
                    user.save(function (err, theSavedUser) {
                        if (err) {
                            consoleLogger(errorLogger(module, err));
                            error_neg_1({
                                confirmed: false,
                                theUser: null,
                                showBanner: true,
                                bannerClass: 'alert alert-warning',
                                msg: 'There was a problem confirming your email. Please try again'
                            });
                        } else {
                            consoleLogger(successLogger(module));
                            success({
                                confirmed: true,
                                theUser: theSavedUser,
                                showBanner: true,
                                bannerClass: 'alert alert-success',
                                msg: 'Your email has been successfully confirmed'
                            });
                        }
                    });
                } else {
                    consoleLogger(successLogger(module, 'user was not admin already'));
                    success({
                        confirmed: true,
                        theUser: user,
                        showBanner: true,
                        bannerClass: 'alert alert-success',
                        msg: 'Your email account was already confirmed. No need to confirm again'
                    });
                }
            }
        });
    },

    getUsersCount: function (error_neg_1, error_0, finalSuccess) {
        var module = 'getUsersCount';
        receivedLogger(module);
        var usersCount = {
            allUsers: 0,
            adminUsers: 0,
            localUsers: 0,
            approvedUsers: 0,
            usersNotApproved: 0,
            bannedUsers: 0,
            usersNotBanned: 0
        };

        getAllUsersCount();

        function getAllUsersCount() {
            countAllUsers(error_neg_1, error_0, success);
            function success(num) {
                usersCount.allUsers = num;
                getAdminUsersCount();
            }
        }

        function getAdminUsersCount() {
            countAdminUsers(error_neg_1, error_0, success);
            function success(num) {
                usersCount.adminUsers = num;
                getLocalUsersCount();
            }
        }

        function getLocalUsersCount() {
            countLocalUsers(error_neg_1, error_0, success);
            function success(num) {
                usersCount.localUsers = num;
                getApprovedUsersCount();
            }
        }

        function getApprovedUsersCount() {
            countApprovedUsers(error_neg_1, error_0, success);
            function success(num) {
                usersCount.approvedUsers = num;
                getUsersNotApprovedCount();
            }
        }

        function getUsersNotApprovedCount() {
            countUsersNotApproved(error_neg_1, error_0, success);
            function success(num) {
                usersCount.usersNotApproved = num;
                getBannedUsersCount();
            }
        }

        function getBannedUsersCount() {
            countBannedUsers(error_neg_1, error_0, success);
            function success(num) {
                usersCount.bannedUsers = num;
                getUsersNotBannedCount();
            }
        }

        function getUsersNotBannedCount() {
            countUsersNotBanned(error_neg_1, error_0, success);
            function success(num) {
                usersCount.usersNotBanned = num;
                consoleLogger(successLogger(module));
                finalSuccess(usersCount);
            }
        }
    },

    getAllUsers: function (error_neg_1, error_0, success) {
        var module = 'getAllUsers';
        receivedLogger(module);
        User.find({}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "No users found"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    },

    getAdminUsers: function (error_neg_1, error_0, success) {
        var module = 'getAdminUsers';
        receivedLogger(module);
        User.find({isAdmin: true}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "No admin users found"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    },

    addAdminPrivileges: function (userUniqueCuid, error_neg_1, error_0, success) {
        var module = 'addAdminPrivileges';
        receivedLogger(module);
        User.findOne({uniqueCuid: userUniqueCuid}, function (err, user) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (user == null || user == undefined || user.length == 0) {
                consoleLogger(successLogger(module, "Could not find the user with the given uniqueCuid"));
                error_0(0);
            } else {
                if (user.isBanned.status === false && user.isApproved === true && user.isAdmin === false) {
                    user.isAdmin = true;
                    user.save(function (err, theSavedUser) {
                        if (err) {
                            consoleLogger(errorLogger(module, err));
                            error_neg_1(-1, err);
                        } else {
                            consoleLogger(successLogger(module));
                            success(theSavedUser);
                        }
                    });
                } else {
                    consoleLogger(successLogger(module, 'cannot make banned/unApproved/admin user admin'));
                    success(null);
                }
            }
        });
    },

    removeAdminPrivileges: function (userUniqueCuid, error_neg_1, error_0, success) {
        var module = 'removeAdminPrivileges';
        receivedLogger(module);
        User.findOne({uniqueCuid: userUniqueCuid}, function (err, user) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (user == null || user == undefined || user.length == 0) {
                consoleLogger(successLogger(module, "Could not find the user with the given uniqueCuid"));
                error_0(0);
            } else {
                if (user.isAdmin === true) {
                    user.isAdmin = false;
                    user.save(function (err, theSavedUser) {
                        if (err) {
                            consoleLogger(errorLogger(module, err));
                            error_neg_1(-1, err);
                        } else {
                            consoleLogger(successLogger(module));
                            success(theSavedUser);
                        }
                    });
                } else {
                    consoleLogger(successLogger(module, 'user was not admin already'));
                    success(null);
                }
            }
        });
    },

    getLocalUsers: function (error_neg_1, error_0, success) {
        var module = 'getLocalUsers';
        receivedLogger(module);
        User.find({isAdmin: false}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "No local users found"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    },

    getApprovedUsers: function (error_neg_1, error_0, success) {
        var module = 'getApprovedUsers';
        receivedLogger(module);
        User.find({isApproved: true}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "No approve dUsers users found"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    },

    approveUser: function (userUniqueCuid, error_neg_1, error_0, success) {
        var module = 'approveUser';
        receivedLogger(module);
        User.findOne({uniqueCuid: userUniqueCuid}, function (err, user) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (user == null || user == undefined || user.length == 0) {
                consoleLogger(successLogger(module, "Could not find the user with the given uniqueCuid"));
                error_0(0);
            } else {
                if (user.isBanned.status === false && user.isApproved === false) {
                    user.isApproved = true;
                    user.save(function (err, theSavedUser) {
                        if (err) {
                            consoleLogger(errorLogger(module, err));
                            error_neg_1(-1, err);
                        } else {
                            consoleLogger(successLogger(module));
                            success(theSavedUser);
                        }
                    });
                } else {
                    consoleLogger(successLogger(module, 'user was banned/approved already'));
                    success(null);
                }
            }
        });
    },

    getUsersNotApproved: function (error_neg_1, error_0, success) {
        var module = 'getUsersNotApproved';
        receivedLogger(module);
        User.find({isApproved: false}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "No unApproved Users users found"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    },

    getBannedUsers: function (error_neg_1, error_0, success) {
        var module = 'getBannedUsers';
        receivedLogger(module);
        User.find({"isBanned.status": true}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "No banned users found"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    },

    banUser: function (userUniqueCuid, error_neg_1, error_0, success) {
        var module = 'banUser';
        receivedLogger(module);
        User.findOne({uniqueCuid: userUniqueCuid}, function (err, user) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (user == null || user == undefined || user.length == 0) {
                consoleLogger(successLogger(module, "Could not find the user with the given uniqueCuid"));
                error_0(0);
            } else {
                if (user.isBanned.status === false) {
                    //ban user and remove admin privileges
                    user.isBanned.status = true;
                    user.isAdmin = false;
                    user.save(function (err, theSavedUser) {
                        if (err) {
                            consoleLogger(errorLogger(module, err));
                            error_neg_1(-1, err);
                        } else {
                            consoleLogger(successLogger(module));
                            success(theSavedUser);
                        }
                    });
                } else {
                    //user is banned, cannot make him admin
                    consoleLogger(errorLogger(module, 'cannot ban an already banned user'));
                    success(null);
                }
            }
        });
    },

    unBanUser: function (userUniqueCuid, error_neg_1, error_0, success) {
        var module = 'unBanUser';
        receivedLogger(module);
        User.findOne({uniqueCuid: userUniqueCuid}, function (err, user) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (user == null || user == undefined || user.length == 0) {
                consoleLogger(successLogger(module, "Could not find the user with the given uniqueCuid"));
                error_0(0);
            } else {
                if (user.isBanned.status === true) {
                    user.isBanned.status = false;
                    user.save(function (err, theSavedUser) {
                        if (err) {
                            consoleLogger(errorLogger(module, err));
                            error_neg_1(-1, err);
                        } else {
                            consoleLogger(successLogger(module));
                            success(theSavedUser);
                        }
                    });
                } else {
                    consoleLogger(successLogger(module, 'user was already active'));
                    success(null);
                }
            }
        });
    },

    getUsersNotBanned: function (error_neg_1, error_0, success) {
        var module = 'getUsersNotBanned';
        receivedLogger(module);
        User.find({"isBanned.status": false}, {password: 0, _id: 0}, function (err, usersArray) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (usersArray == null || usersArray == undefined || usersArray.length == 0) {
                consoleLogger(successLogger(module, "Did not find users who are not banned"));
                success([]);
            } else {
                consoleLogger(successLogger(module));
                success(usersArray);
            }
        });
    }
};