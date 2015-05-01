var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var cuid = require('cuid');
var Post = require("../database/posts/post_model.js");
var User = require("../database/users/user_model.js");
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

    makeNewPost: function (req, res, postObject, success) {
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
        success(post);
    },

    makeQuestionUpdate: function (questionObject, theUser, success) {
        var question = {
            "heading": questionObject.heading,
            "question": questionObject.question,
            "shortQuestion": questionObject.shortQuestion,
            "lastActivity": new Date()
        };
        success(question);
    },


    saveNewPost: function (post, error_neg_1, error_0, success) {
        post.save(function (err, savedPost) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                //this returns an object
                success(savedPost);
            }
        });
    },


    updateQuestion: function (questionObject, questionIndex, error_neg_1, error_0, success) {
        Post.update({questionIndex: questionIndex},
            {
                $set: {
                    question: questionObject["question"],
                    heading: questionObject["heading"],
                    shortQuestion: questionObject["shortQuestion"],
                    lastActivity: questionObject["lastActivity"]
                }
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            })
    },


    pushQuestionToAsker: function (openId, index, error_neg_1, error_0, success) {
        User.update({id: openId}, {
            $addToSet: {askedQuestionsIndexes: index}
        }, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }

        });
    },


    getCount: function (error_neg_1, error_0, success) {
        var questionCount;
        Post.count({}, function (err, count) {
            if (err) {
                error_neg_1(-1, err);
            } else if (count == null || count == undefined) {
                questionCount = 0;
                success(questionCount);
            } else {
                questionCount = count;
                success(questionCount);
            }
        });
    },


    getPosts: function (sort, page, limit, error_neg_1, error_0, success) {
        var errors = 0;
        Post.find()
            .sort({postIndex: sort})
            .skip((page - 1) * 10)
            .limit(limit)
            .exec(function (err, postsArray) {
                if (err) {
                    error_neg_1(-1, err);
                    errors++;
                } else if (postsArray == null || postsArray == undefined || postsArray.length == 0) {
                    postsArray = [];
                }
                if (errors == 0) {
                    var postsCount = 0;
                    Post.count({}, function (err, count) {
                        if (err) {
                            error_neg_1(-1, err);
                        } else if (count == null || count == undefined) {
                            postsCount = 0;
                            success(postsArray, postsCount);
                        } else {
                            postsCount = count;
                            success(postsArray, postsCount);
                        }
                    });
                }
            });
    },

    getPost: function (postIndex, error_neg_1, error_0, success) {
        sideUpdates.updateNumberOfVisits(postIndex, error_neg_1, error_0, done);

        function done() {
            var errors = 0;
            Post.findOne({postIndex: postIndex})
                .exec(function (err, thePost) {
                    if (err) {
                        error_neg_1(-1, err);
                        errors++;
                    } else if (thePost == null || thePost == undefined || thePost.length == 0) {
                        thePost = {};
                        success(thePost);
                    } else {
                        success(thePost);
                    }
                })
        }
    },


    getHotThisWeek: function (quantity, error_neg_1, error_0, success) {
        Post.find({numberOfVisits: {$gt: 0}})
            .sort({numberOfVisits: -1})
            .limit(quantity)
            .exec(function (err, hotThisWeekArray) {
                if (err) {
                    error_neg_1(-1, err);
                } else if (hotThisWeekArray.length == 0) {
                    success([]);
                } else {
                    success(hotThisWeekArray);
                }
            });
    },


    pushUpvoteToUpvoter: function (openId, upvotedIndex, error_neg_1, error_0, success) {
        User.update({id: openId}, {
                $addToSet: {votedQuestionIndexes: upvotedIndex}
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            }
        )
    },


    pullUpvoteFromUpvoter: function (openId, upvotedIndex, error_neg_1, error_0, success) {
        User.update({id: openId}, {
                $pull: {votedQuestionIndexes: upvotedIndex}
            }, function (err) {
                if (err) {
                    error_neg_1(-1, err);
                } else {
                    success();
                }
            }
        )
    },


    changeQuestionVotes: function (upvotedIndex, inc, error_neg_1, error_0, success) {
        Post.update({questionIndex: upvotedIndex}, {$inc: {votes: inc}}, function (err) {
            if (err) {
                error_neg_1(-1, err);
            } else {
                success();
            }
        })
    }


};
