var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var postDB = require('../db/post_db.js');
var forms = require('../functions/forms.js');

var fileName = 'post_handlers.js';

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


    newPost: function (req, res, theNewPost) {
        var module = 'newPost';
        receivedLogger(module);

        //theNewPost consists of the theNewPost.heading and theNewPost.content

        forms.validateNewPost(req, res, theNewPost, postValidated);

        function postValidated() {
            postDB.makeNewPost(req, res, theNewPost, made);

            function made(post) {
                postDB.saveNewPost(post, error, error, saved);

                function saved(savedPost) {
                    consoleLogger(successLogger(module));
                    ioJs.emitToAll('newPost', {
                        "post": savedPost,
                        "postCount": savedPost.postIndex
                    });
                    res.status(200).send({
                        code: 200,
                        notify: true,
                        type: 'success',
                        msg: 'You new post has been successfully saved'
                    });
                }
            }
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to createPost. Please try again'
            });
        }
    },

    updateQuestion: function (req, res, theUser, theQuestion) {
        consoleLogger('updateQuestion: UPDATE_QUESTION event handler called');
        var thisQuestionIndex = theQuestion.questionIndex;
        if (!(/^\s+$/.test(theQuestion.heading)) &&
            theQuestion.heading.length != 0 && !(/^\s+$/.test(theQuestion.question)) &&
            theQuestion.question.length != 0) {

            function error(status, err) {
                consoleLogger("ERROR: updateQuestion event_Handler: " + err);
                res.status(500).send({msg: 'ERROR: updateQuestion Event Handler: ', err: err});
                consoleLogger("updateQuestion failed!")
            }

            function made(question) {
                function updated() {
                    function done(questionObject) {
                        ioJs.emitToAll('newQuestion', {
                            "question": questionObject,
                            "index": questionObject.questionIndex,
                            "update": true,
                            "questionCount": null
                        });
                        res.status(200).send({msg: 'updateQuestion success'});
                        consoleLogger('updateQuestion: Success');
                    }

                    postDB.getOneQuestion(thisQuestionIndex, error, error, done);
                }

                postDB.updateQuestion(question, thisQuestionIndex, error, error, updated);
            }

            postDB.makeQuestionUpdate(theQuestion, theUser, made);

        } else {
            //the question does not pass the checks
            res.status(500).send({msg: 'updateQuestion did not pass checks'});
            consoleLogger('updateQuestion: Not executed: Did not pass checks');
        }
    },


    upvote: function (req, res, theUser, upvotedIndex, inc) {
        consoleLogger("upvote: upvote event handler called");
        var upvotedArray = theUser.votedQuestionIndexes;
        var errorCounter = 0;
        switch (inc) {
            case 1:
                //check to see if the user already upvoted this question to avoid repetition
                if (upvotedArray.indexOf(upvotedIndex) > -1) {
                    repetitionResponse();
                    errorCounter++;
                } else {
                    upvotedArray.push(upvotedIndex);
                }
                break;
            case -1:
                //check to see if the user already upvoted this question to avoid repetition
                if (upvotedArray.indexOf(upvotedIndex) == -1) {
                    repetitionResponse();
                    errorCounter++;
                } else if (upvotedArray.indexOf(upvotedIndex) != -1) {
                    upvotedArray.splice(upvotedArray.indexOf(upvotedIndex), 1);
                }
                break;
            default:
                errorCounter++;
                consoleLogger("ERROR: upvote event handler: switch statement got unexpected value");
                res.status(500).send({
                    msg: 'ERROR: upvote event handler: switch statement got unexpected value'
                });
                consoleLogger('upvote: failed!');
        }

        function error(status, err) {
            if (status == -1) {
                consoleLogger("ERROR: upvote event handler: Error while executing db operations" + err);
                res.status(500).send({
                    msg: 'ERROR: upvote event handler: Error while executing db operations',
                    err: err
                });
                consoleLogger('upvote: failed!');
            } else if (status == 0) {
                //this will mostly be returned be the findTopVotedQuestions query
                ioJs.emitToOne(theUser.socketRoom, "upvotedIndexes", upvotedArray);
                ioJs.emitToAll('topVoted', []);
                res.status(200).send({msg: "upvote: partial ERROR: Status:200: query returned null/undefined: There might also be no top voted object"});
                consoleLogger('**partial ERROR!: Status:200 upvote event handler: failure: query returned NULL/UNDEFINED: There might be no top voted object');
            }
        }

        function success() {
            function done() {
                function found(topVotedArrayOfObjects) {

                    ioJs.emitToAll('topVoted', topVotedArrayOfObjects);
                    ioJs.emitToOne(theUser.socketRoom, 'upvotedIndexes', upvotedArray);
                    res.status(200).send({msg: 'upvote success'});
                    consoleLogger('upvote: Success');
                }

                postDB.findTopVotedQuestions(-1, 10, error, error, found);
            }

            postDB.changeQuestionVotes(upvotedIndex, inc, error, error, done);
        }

        function repetitionResponse() {
            res.status(200).send({msg: 'upvote success: There was an upvote/downvote repetition'});
            consoleLogger('upvote success: There was an upvote/downvote repetition');
        }

        if (errorCounter == 0) {
            switch (inc) {
                case 1:
                    postDB.pushUpvoteToUpvoter(req.user.id, upvotedIndex, error, error, success);
                    break;
                case -1:
                    postDB.pullUpvoteFromUpvoter(req.user.id, upvotedIndex, error, error, success);
                    break;
            }
        }
    },

    getPosts: function (req, res, page) {
        var module = 'getPosts';
        receivedLogger(module);

        var temp = {};
        var limit = 10;

        postDB.getPosts(-1, page, limit, error, error, success);

        function success(postsArray, postsCount) {
            temp['postsCount'] = postsCount;
            temp['postsArray'] = postsArray;
            consoleLogger(successLogger(module));
            res.status(200).send(temp);
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'Failed to retrieve your personalized posts. Please reload this page',
                disable: true
            });
        }
    },

    getPost: function (req, res, postIndex) {
        var module = 'getPost';
        receivedLogger(module);

        postDB.getPost(postIndex, error, error, success);

        function success(thePost) {
            res.status(200).send({
                thePost: thePost
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'Failed to retrieve this post. Please try again or reload this page',
                disable: true
            });
        }
    },

    getHotThisWeek: function (req, res, quantity) {
        var module = 'getHotThisWeek';
        receivedLogger(module);

        postDB.getHotThisWeek(quantity, error, error, success);

        function success(hotThisWeekArray) {
            consoleLogger(successLogger(module));
            res.status(200).send({
                hotThisWeek: hotThisWeekArray
            });
        }

        function error() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'Failed to retrieve this weeks top posts. Please reload page ',
            });
        }
    },


    retrieveQuestion: function (req, res, theUser, questionIndex) {
        consoleLogger("getQuestions: getQuestions called");
        var temp = {};

        function error(status, err) {
            if (status == -1) {
                consoleLogger("retrieveQuestion handler: GetQuestions: Error while retrieving questions" + err);
                res.status(500).send({
                    msg: 'retrieveQuestion: retrieveQuestion: Error while retrieving questions',
                    err: err
                });
                consoleLogger('retrieveQuestion: failed!');
            } else if (status == 0) {
                temp['question'] = [];
                temp['upvotedIndexes'] = theUser.votedQuestionIndexes;
                res.status(200).send(temp);
                consoleLogger('retrieveQuestion: Did not find any questions');
            }
        }


        function success(question) {
            temp['question'] = question;
            temp['upvotedIndexes'] = theUser.votedQuestionIndexes;
            res.status(200).send(temp);
        }

        postDB.getOneQuestion(questionIndex, error, error, success)
    }


};