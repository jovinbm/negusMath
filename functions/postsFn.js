var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var $ = require('cheerio');

var fileName = 'postsFn.js';

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

function getPostDate(createdAt) {
    return moment(createdAt).format("ddd, MMM D, H:mm");
}

function getPostAbsoluteUrl(postIndex) {
    return 'http://www.negusmath.com/post/' + postIndex;
}

function getPostPath(postIndex) {
    return '/post/' + postIndex;
}


function getVideoResponsiveVersion(textString) {
    var theElement;
    var imgElement;
    var iframeElement = $("<div class='embed-responsive embed-responsive-16by9'>" +
        "<iframe class='embed-responsive-item' allowfullscreen='true' frameborder='0'></iframe>" +
        "</div>");

    if (textString) {
        //convert the element to string
        theElement = $("<div>" + textString + "</div>");

        //find the video iframe elements
        $('img.ta-insert-video', theElement).each(function () {
            var videoSource = $(this).attr('ta-insert-video');
            $('iframe', iframeElement).attr('src', videoSource);

            //replace in original
            $(this).replaceWith(iframeElement);
        });
        return theElement.html();
    } else {
        return textString;
    }
}


function preparePosts(post, posts, callBack) {
    if (post) {
        if (Object.keys(post).length > 0) {
            var temp = prepare(post);
            callBack(temp);
        } else {
            callBack(post);
        }
    } else if (posts) {
        posts.forEach(function (post, index) {
            if (Object.keys(post).length > 0) {
                posts[index] = prepare(post);
            }
        });
        callBack(posts);
    }

    function prepare(post) {
        post.postDate = getPostDate(post.createdAt);
        post.postAbsoluteUrl = getPostAbsoluteUrl(post.postIndex);
        post.postPath = getPostPath(post.postIndex);
        //post.postHeading = $filter('highlightText')(post.postHeading, true);
        //post.authorName = $filter('highlightText')(post.authorName, true);
        post.postSummary = getVideoResponsiveVersion(post.postSummary);
        post.postContent = getVideoResponsiveVersion(post.postContent);
        //post.postTags = highlightPostTags(post.postTags);
        return post;
    }
}

function preparePostsNoChange(post, posts, callBack) {

    if (post) {
        if (Object.keys(post).length > 0) {
            var temp = prepare(post);
            callBack(temp);
        } else {
            callBack(post);
        }
    } else if (posts) {
        posts.forEach(function (post, index) {
            if (Object.keys(post).length > 0) {
                posts[index] = prepare(post);
            }
        });
        callBack(posts);
    }

    function prepare(post) {
        post.postDate = getPostDate(post.createdAt);
        post.postAbsoluteUrl = getPostAbsoluteUrl(post.postIndex);
        post.postPath = getPostPath(post.postIndex);
        return post;
    }
}

module.exports = {
    preparePosts: function (post, posts, callBack) {
        preparePosts(post, posts, callBack);
    },

    preparePostsNoChange: function (post, posts, callBack) {
        preparePostsNoChange(post, posts, callBack);
    }
};