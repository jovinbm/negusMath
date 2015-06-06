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

function makeVideoIframesResponsive(post, posts) {
    var theElement;
    var imgElement;
    var imgWithClass;
    var imgWrappedInDiv;

    if (post) {
        if (Object.keys(post).length > 0) {
            return makeResp(post);
        } else {
            return post;
        }
    } else if (posts) {
        posts.forEach(function (post, index) {
            if (Object.keys(post).length > 0) {
                posts[index] = makeResp(post);
            }
        });
        return posts;
    }

    function makeResp(post) {
        if (post.postSummary) {
            //convert the element to string
            theElement = $("<div>" + post.postSummary + "</div>");

            //find the video iframe elements
            imgElement = $('img.ta-insert-video', theElement);

            //only perform operation if there are iframes available
            if (imgElement.length > 0) {

                //add class and wrap in div
                mgWithClass = imgElement.addClass('embed-responsive-item');
                imgWrappedInDiv = imgWithClass.wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

                //replace in original
                theElement.find('img').replaceWith(imgWrappedInDiv);
            }
            post.postSummary = theElement.html();

        }
        if (post.postContent) {
            //convert the element to string
            theElement = $("<div>" + post.postContent + "</div>");

            //find the video iframe elements
            imgElement = $('img.ta-insert-video', theElement);

            //only perform operation if there are iframes available
            if (imgElement.length > 0) {

                //add class and wrap in div
                imgWithClass = imgElement.addClass('embed-responsive-item');
                imgWrappedInDiv = imgWithClass.wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

                //replace in original
                theElement.find('img').replaceWith(imgWrappedInDiv);
            }
            post.postContent = theElement.html();
        }
        return post;
    }
}

function getVideoResponsiveVersion(textString) {
    var theElement;
    var imgElement;
    var imgWithClass;
    var imgWrappedInDiv;

    if (textString) {
        //convert the element to string
        theElement = $("<div>" + textString + "</div>");

        //find the video iframe elements
        imgElement = $('img.ta-insert-video', theElement);

        //only perform operation if there are iframes available
        if (imgElement.length > 0) {

            //add class and wrap in div
            imgWithClass = imgElement.addClass('embed-responsive-item');
            imgWrappedInDiv = imgWithClass.wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

            //replace in original
            theElement.find('img').replaceWith(imgWrappedInDiv);
        }
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
            if (index == posts.length - 1) {
                callBack(posts);
            }
        });
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
            if (index == posts.length - 1) {
                callBack(posts);
            }
        });
    }

    function prepare(post) {
        post.postDate = getPostDate(post.createdAt);
        post.postAbsoluteUrl = getPostAbsoluteUrl(post.postIndex);
        post.postPath = getPostPath(post.postIndex);
        return post;
    }
}

function responseFilter(resp) {
    function makeBanner(show, bannerClass, msg) {
        return {
            show: show ? true : false,
            bannerClass: bannerClass,
            msg: msg
        }
    }

    if (resp) {
        if (resp.redirect) {
            if (resp.redirect) {
                $window.location.href = resp.redirectPage;
            }
        }
        if (resp.notify) {
            if (resp.type && resp.msg) {
                $rootScope.showToast(resp.type, resp.msg);
            }
        }
        if (resp.banner) {
            if (resp.bannerClass && resp.msg) {
                $rootScope.$broadcast('universalBanner', makeBanner(true, resp.bannerClass, resp.msg));
            }
        }
        if (resp.newPostBanner) {
            if (resp.bannerClass && resp.msg) {
                $rootScope.$broadcast('newPostBanner', makeBanner(true, resp.bannerClass, resp.msg));
            }
        }
        if (resp.registrationBanner) {
            if (resp.bannerClass && resp.msg) {
                $rootScope.$broadcast('registrationBanner', makeBanner(true, resp.bannerClass, resp.msg));
            }
        }
        if (resp.reason) {
            $log.warn(resp.reason);
        }
    } else {
        //do nothing
    }

    return true;
}


module.exports = {
    preparePosts: function (post, posts, callBack) {
        preparePosts(post, posts, callBack);
    },

    preparePostsNoChange: function (post, posts, callBack) {
        preparePostsNoChange(post, posts, callBack);
    }
};