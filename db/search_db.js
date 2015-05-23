var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var cuid = require('cuid');
var PostSearch = require("../database/search_references/post_search.js");
var User = require("../database/users/user.js");
var sideUpdates = require('./side_updates_db.js');

var fileName = 'search_db.js';

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

    makeNewPostSearch: function (queryString, resultObject, success) {
        var module = 'makeNewPostSearch';
        receivedLogger(module);
        var newPostSearch = new PostSearch({
            searchUniqueCuid: cuid(),
            //searchIndex: taken care by auto-increment
            queryString: queryString,
            resultObject: resultObject
        });
        consoleLogger(successLogger(module));
        success(newPostSearch);
    },


    saveNewPostSearch: function (postSearchObject, error_neg_1, error_0, success) {
        var module = 'saveNewPostSearch';
        receivedLogger(module);
        postSearchObject.save(function (err, savedPostSearchObject) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1, err);
            } else {
                //this returns an object
                consoleLogger(successLogger(module));
                success(savedPostSearchObject);
            }
        });
    },

    getPostSearch: function (searchUniqueCuid, queryString, error_neg_1, error_0, success) {
        var module = 'getPostSearch';
        receivedLogger(module);
        PostSearch.findOne({
            $and: [
                {searchUniqueCuid: searchUniqueCuid},
                {queryString: queryString}
            ]
        })
            .exec(function (err, postSearchObject) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (postSearchObject == null || postSearchObject == undefined || postSearchObject.length == 0) {
                    consoleLogger(successLogger(module, 'No postSearch object found'));
                    error_0(0);
                } else {
                    success(postSearchObject);
                }
            });
    }
};
