var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var ioJs = require('../functions/io.js');
var postDB = require('../db/post_db.js');

var fileName = 'basic_handlers.j';
var fileName2 = 'basic_handlers.ssss';

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

    startUp: function (req, res, theUser) {
        consoleLogger('startUp: STARTUP handler called');
        var limit = 10;
        var page = 1;

        var temp = {};
        temp['upvotedIndexes'] = theUser.votedQuestionIndexes;
        temp['uniqueCuid'] = theUser.uniqueCuid;

        function getQuestionsErr(status, err) {
            if (status == -1) {
                consoleLogger("startUp handler: GetQuestions: Error while retrieving home details" + err);
                res.status(500).send({msg: 'startUp: GetQuestions: Error while retrieving home details', err: err});
                consoleLogger('startUp: failed!');
            }
        }

        function getTopErr(status, err) {
            if (status == -1) {
                consoleLogger("startUp handler: GetTop: Error while retrieving home details" + err);
                res.status(500).send({msg: 'startUp: GetTop: Error while retrieving home details', err: err});
                consoleLogger('startUp: failed!');
            }
        }

        function done(topVotedArray) {
            if (topVotedArray == []) {
                consoleLogger('startup handler: Did not find any top voted');
            }
            temp['topVotedArray'] = topVotedArray;
            res.status(200).send(temp);
            consoleLogger("StartUp success");
        }

        function getTop() {
            postDB.findTopVotedQuestions(-1, 10, getTopErr, getTopErr, done);
        }

        function success(questionsArray, questionCount) {
            if (questionsArray == []) {
                consoleLogger("startup handler: no  questions found");
            }
            temp['questionsArray'] = questionsArray;
            temp['questionCount'] = questionCount;
            getTop();
        }

        postDB.getQuestions(-1, page, limit, getQuestionsErr, getQuestionsErr, success)
    },


    reconnect: function (req, res, theUser, page) {
        consoleLogger('reconnect: RECONNECT handler called');
        var limit = 10;
        ioJs.emitToOne(theUser.socketRoom, "usersOnline", online.getUsersOnline());

        var temp = {};
        temp['uniqueCuid'] = theUser.uniqueCuid;
        temp['upvotedIndexes'] = theUser.votedQuestionIndexes;

        function getQuestionsErr(status, err) {
            if (status == -1) {
                consoleLogger("reconnect handler: getQuestions: Error while retrieving home details" + err);
                res.status(500).send({msg: 'reconnect: getQuestions: Error while retrieving home details', err: err});
                consoleLogger('reconnect handler: failed!');
            }
        }

        function getTopErr(status, err) {
            if (status == -1) {
                consoleLogger("reconnect handler: GetTop: Error while retrieving home details" + err);
                res.status(500).send({msg: 'reconnect: GetTop: Error while retrieving home details', err: err});
                consoleLogger('reconnect handler: failed!');
            }
        }

        function done(topVotedArray) {
            if (topVotedArray == []) {
                consoleLogger('reconnect: Did not find any top voted');
            }
            temp['topVotedArray'] = topVotedArray;
            res.status(200).send(temp);
            consoleLogger("reconnect success");
        }

        function getTop() {
            postDB.findTopVotedQuestions(-1, 10, getTopErr, getTopErr, done);
        }

        function success(questionsArray, questionCount) {
            if (questionsArray == []) {
                consoleLogger("reconnect: no questions found");
            }
            temp['questionsArray'] = questionsArray;
            temp['questionCount'] = questionCount;
            getTop();
        }

        postDB.getQuestions(-1, page, limit, getQuestionsErr, getQuestionsErr, success)
    }


};