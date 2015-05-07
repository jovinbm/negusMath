var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var cuid = require('cuid');
var Post = require("../database/posts/post.js");
var User = require("../database/users/user.js");
var sideUpdates = require('./side_updates_db.js');

var fileName = 'post_db.js';

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

    getPosts: function (sort, page, limit, error_neg_1, error_0, success) {
        var module = 'getPosts';
        receivedLogger(module);
        var errors = 0;
        Post.find()
            .sort({postIndex: sort})
            .skip((page - 1) * 10)
            .limit(limit)
            .exec(function (err, postsArray) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    errors++;
                    error_neg_1(-1, err);
                } else if (postsArray == null || postsArray == undefined || postsArray.length == 0) {
                    consoleLogger(successLogger(module, 'No posts found'));
                    postsArray = [];
                }
                if (errors == 0) {
                    var postsCount = 0;
                    Post.count({}, function (err, count) {
                        if (err) {
                            consoleLogger(errorLogger(module, 'Failed to count posts', err));
                            error_neg_1(-1, err);
                        } else if (count == null || count == undefined) {
                            postsCount = 0;
                            consoleLogger(successLogger(module));
                            success(postsArray, postsCount);
                        } else {
                            postsCount = count;
                            consoleLogger(successLogger(module));
                            success(postsArray, postsCount);
                        }
                    });
                }
            });
    },

    getPost: function (postIndex, error_neg_1, error_0, success) {
        var module = 'getPost';
        receivedLogger(module);
        sideUpdates.updateNumberOfVisits(postIndex, error_neg_1, error_0, done);

        function done() {
            var errors = 0;
            Post.findOne({postIndex: postIndex})
                .exec(function (err, thePost) {
                    if (err) {
                        consoleLogger(errorLogger(module, err));
                        errors++;
                        error_neg_1(-1, err);
                    } else if (thePost == null || thePost == undefined || thePost.length == 0) {
                        consoleLogger(errorLogger(module, 'No post found with the given postIndex'));

                        //redirect user since the post they are trying to access is not available
                        error_0(0);
                    } else {
                        consoleLogger(successLogger(module));
                        success(thePost);
                    }
                })
        }
    },

    getSuggestedPosts: function (quantity, error_neg_1, error_0, success) {
        var module = 'getSuggestedPosts';
        receivedLogger(module);
        Post.find({numberOfVisits: {$gt: 0}})
            .sort({numberOfVisits: -1})
            .limit(quantity)
            .exec(function (err, postsArray) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (postsArray.length == 0) {
                    consoleLogger(successLogger(module, "SuggestedPosts is empty"));
                    success([]);
                } else {
                    consoleLogger(successLogger(module));
                    success(postsArray);
                }
            });
    },


    getHotThisWeek: function (quantity, error_neg_1, error_0, success) {
        var module = 'getHotThisWeek';
        receivedLogger(module);
        Post.find({numberOfVisits: {$gt: 0}})
            .sort({numberOfVisits: -1})
            .limit(quantity)
            .exec(function (err, hotThisWeekArray) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (hotThisWeekArray.length == 0) {
                    consoleLogger(successLogger(module, "HotThisWeek is empty"));
                    success([]);
                } else {
                    consoleLogger(successLogger(module));
                    success(hotThisWeekArray);
                }
            });
    },

    makeNewPost: function (req, res, postObject, success) {
        var module = 'makeNewPost';
        receivedLogger(module);
        var theUser = getTheUser(req);
        var post = new Post({
            postUniqueCuid: cuid(),
            //postIndex: taken care by auto-increment
            authorUniqueCuid: theUser.uniqueCuid,
            authorName: theUser.firstName + " " + theUser.lastName,
            authorUsername: theUser.username,
            authorEmail: theUser.email,
            postHeading: postObject.postHeading,
            postContent: postObject.postContent,
            postSummary: postObject.postSummary
        });
        consoleLogger(successLogger(module));
        success(post);
    },

    saveNewPost: function (post, error_neg_1, error_0, success) {
        var module = 'saveNewPost';
        receivedLogger(module);
        post.save(function (err, savedPost) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else {
                //this returns an object
                consoleLogger(successLogger(module));
                success(savedPost);
            }
        });
    },

    makePostUpdate: function (req, res, postObject, success) {
        var module = 'makePostUpdate';
        receivedLogger(module);
        var theUser = getTheUser(req);
        var post = {
            postIndex: postObject.postIndex,
            postUniqueCuid: postObject.postUniqueCuid,
            authorUniqueCuid: theUser.uniqueCuid,
            authorName: theUser.firstName + " " + theUser.lastName,
            authorUsername: theUser.username,
            authorEmail: theUser.email,
            postHeading: postObject.postHeading,
            postContent: postObject.postContent,
            postSummary: postObject.postSummary
        };
        consoleLogger(successLogger(module));
        success(post);
    },


    updatePost: function (postToUpdate, error_neg_1, error_0, success) {
        var module = 'updatePost';
        receivedLogger(module);

        Post.findOne({postIndex: postToUpdate.postIndex})
            .exec(function (err, thePost) {
                if (err) {
                    consoleLogger(errorLogger(module, "findOne", err));
                    error_neg_1(-1, err);
                } else if (thePost == null || thePost == undefined || thePost.length == 0) {
                    consoleLogger(errorLogger(module, 'No post found with the given postIndex (wanted to update)'));
                    //redirect user since the post they are trying to access is not available
                    error_0(0);
                } else {
                    //update the post
                    thePost.authorUniqueCuid = postToUpdate.authorUniqueCuid;
                    thePost.authorName = postToUpdate.authorName;
                    thePost.authorUsername = postToUpdate.authorUsername;
                    thePost.authorEmail = postToUpdate.authorEmail;
                    thePost.postHeading = postToUpdate.postHeading;
                    thePost.postContent = postToUpdate.postContent;
                    thePost.postSummary = postToUpdate.postSummary;

                    thePost.save(function (err, savedPost) {
                        if (err) {
                            consoleLogger(errorLogger(module, 'save', err));
                            error_neg_1(-1, err);
                        } else {
                            //this returns an object
                            consoleLogger(successLogger(module));
                            success(savedPost);
                        }
                    });
                }
            });
    },

    getCount: function (error_neg_1, error_0, success) {
        var module = 'getCount';
        receivedLogger(module);
        var postCount;
        Post.count({}, function (err, count) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else if (count == null || count == undefined) {
                postCount = 0;
                consoleLogger(successLogger(module));
                success(postCount);
            } else {
                postCount = count;
                consoleLogger(successLogger(module));
                success(postCount);
            }
        });
    },

    searchForPosts: function (queryString, quantity, error_neg_1, error_0, success) {
        var module = 'searchForPosts';
        receivedLogger(module);
        Post.textSearch(queryString, function (err, output) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else {
                consoleLogger(successLogger(module));
                success(output);
            }
        });
    }


};
