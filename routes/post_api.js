var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var post_handler = require('../handlers/post_handlers.js');
var userDB = require('../db/user_db.js');

var fileName = 'post_api.js';

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


    getPosts: function (req, res) {
        var module = 'getPosts';
        receivedLogger(module);
        var page = req.body.page;
        post_handler.getPosts(req, res, page);
    },

    getPost: function (req, res) {
        var module = 'getPost';
        receivedLogger(module);
        var postIndex = req.body.postIndex;
        post_handler.getPost(req, res, postIndex);
    },


    newPost: function (req, res) {
        var module = 'newPost';
        receivedLogger(module);
        post_handler.newPost(req, res, req.body.newPost);
    },

    getHotThisWeek: function (req, res) {
        var module = 'getHotThisWeek';
        receivedLogger(module);
        var quantity = 7;
        post_handler.getHotThisWeek(req, res, quantity);
    },


    updateQuestion: function (req, res) {
        basic.consoleLogger('UPDATE_QUESTION event received');
        var theQuestion = req.body;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: updateQuestionPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: updateQuestionPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                post_handler.updateQuestion(req, res, theUser, theQuestion);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    },


    upvote: function (req, res) {
        basic.consoleLogger('UPVOTE event received');
        var upvotedIndex = req.body.upvoteIndex;
        var inc = req.body.inc;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'ERROR: upvotePOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: upvotePOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                if (inc == -1 || theUser.votedQuestionIndexes.indexOf(upvotedIndex) == -1) {
                    post_handler.upvote(req, res, theUser, upvotedIndex, inc);
                } else {
                    //upvote process did not pass checks
                    res.status(200).send({msg: 'upvote did not pass checks'});
                    basic.consoleLogger('upvote: Not executed: Did not pass checks');
                }
            } else {
                //TODO -- redirect to login
            }
        }

        userDB.findUser(req.user.id, error, error, success);
    }


};