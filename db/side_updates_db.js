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
    return basic.getTheUser(req);
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
    },

    addNewFieldToAll: function () {
        var module = 'addNewFieldToAll';
        Post.update({}, {
                $set: {
                    "postUploads": []
                }
            },
            {
                upsert: false,
                multi: true
            }).exec(function (err) {
                if (err) {
                    consoleLogger("****************** " + errorLogger(module, err));
                } else {
                    consoleLogger("******************* " + successLogger(module));
                }
            });
    },

    addNewFieldWithAFunction: function () {
        var module = 'addNewFieldWithAFunction';
        User.find({}, function (err, usersArray) {
            if (err) {
                consoleLogger("****************** " + errorLogger(module, err));
            } else {

                var totalCount = usersArray.length;
                var currentCount = 0;

                function hash(userUniqueCuid, success) {
                    success(cuid());
                }

                function doNext() {
                    if (currentCount < totalCount) {
                        function success(hashedUniqueCuid) {
                            usersArray[currentCount].hashedUniqueCuid = hashedUniqueCuid;
                            usersArray[currentCount].save(function (err) {
                                if (err) {
                                    consoleLogger("******************** " + errorLogger(module, err));
                                } else {
                                    ++currentCount;
                                    doNext();
                                }
                            });
                        }

                        hash(usersArray[currentCount].uniqueCuid, success);
                    } else {
                        consoleLogger("******************* " + successLogger(module));
                    }
                }

                doNext();
            }
        })
    },

    addEmptyArrayFieldToAll: function () {
        var module = 'addEmptyArrayFieldToAll';
        Post.find({}, function (err, postsArray) {
            if (err) {
                consoleLogger("****************** " + errorLogger(module, err));
            } else {

                var totalCount = postsArray.length;
                var currentCount = 0;

                function doNext() {
                    if (currentCount < totalCount) {
                        consoleLogger(postsArray[currentCount].postUploads);
                        postsArray[currentCount].postUploads = [];
                        postsArray[currentCount].save(function (err) {
                            if (err) {
                                consoleLogger("******************** " + errorLogger(module, err));
                            } else {
                                ++currentCount;
                                doNext();
                            }
                        });
                    } else {
                        consoleLogger("******************* " + successLogger(module));
                    }
                }

                doNext();
            }
        })
    }
};
