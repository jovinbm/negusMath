var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var cuid = require('cuid');
var Post = require("../database/posts/post.js");
var searchDB = require("./search_db.js");
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
    return basic.getTheUser(req);
}

//function that changes the angular tags in the format {'text': tag} into just an array of strings
//takes in a single post or multiple posts
function preparePostTagsToDatabase(post, updateOneOnly, postsArray, updateMany, success) {
    var module = 'preparePostTagsToDatabase';
    receivedLogger(module);
    if (updateOneOnly) {
        var temp = [];
        post.postTags.forEach(function (angularTag) {
            temp.push(angularTag['text']);
        });
        post.postTags = temp;
        success(post);
    } else if (updateMany) {
        postsArray.forEach(function (post) {
            var temp = [];
            post.postTags.forEach(function (angularTag) {
                temp.push(angularTag['text']);
            });
            post.postTags = temp;
        });
        consoleLogger(successLogger(module));
        success(postsArray);
    }
}


//function that changes the string tags in a post into the {'text': tag} object format
//for angular tags
function preparePostTagsToClient(post, updateOneOnly, postsArray, updateMany, success) {
    var module = 'preparePostTagsToClient';
    receivedLogger(module);
    if (updateOneOnly) {
        var temp = [];
        post.postTags.forEach(function (tag) {
            temp.push({
                'text': tag
            });
        });
        post.postTags = temp;
        success(post);
    } else if (updateMany) {
        postsArray.forEach(function (post) {
            var temp = [];
            post.postTags.forEach(function (tag) {
                temp.push({
                    'text': tag
                });
            });
            post.postTags = temp;
        });
        consoleLogger(successLogger(module));
        success(postsArray);
    }
}


module.exports = {

    getPosts: function (sort, page, limit, error_neg_1, error_0, success) {
        var module = 'getPosts';
        receivedLogger(module);
        var errors = 0;
        Post.find({isTrashed: false})
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
                    preparePostTagsToClient(null, null, postsArray, true, doneTags);
                } else {
                    preparePostTagsToClient(null, null, postsArray, true, doneTags);
                }
                function doneTags(postsArray) {
                    if (errors == 0) {
                        var postsCount = 0;
                        Post.count({isTrashed: false}, function (err, count) {
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
                }
            });
    },

    getPostsWithUniqueCuids: function (theArray, error_neg_1, error_0, success) {
        var module = 'getPostsWithUniqueCuids';
        receivedLogger(module);
        Post.find({
            postUniqueCuid: {
                $in: theArray
            },
            isTrashed: false
        })
            .exec(function (err, postsArray) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (postsArray == null || postsArray == undefined || postsArray.length == 0) {
                    consoleLogger(successLogger(module, 'No posts found'));
                    postsArray = [];
                    //will call success with the postsArray
                    preparePostTagsToClient(null, null, postsArray, true, success);
                } else {
                    consoleLogger(successLogger(module));
                    //will call success with the postsArray
                    preparePostTagsToClient(null, null, postsArray, true, success);
                }
            });
    },

    getPost: function (postIndex, error_neg_1, error_0, success) {
        var module = 'getPost';
        receivedLogger(module);
        sideUpdates.updateNumberOfVisits(postIndex, error_neg_1, error_0, done);

        function done() {
            var errors = 0;
            Post.findOne({
                postIndex: postIndex,
                isTrashed: false
            })
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
                        //will call success with the post
                        preparePostTagsToClient(thePost, true, null, null, success);
                    }
                })
        }
    },

    getSuggestedPosts: function (quantity, error_neg_1, error_0, success) {
        var module = 'getSuggestedPosts';
        receivedLogger(module);
        Post.find({
            numberOfVisits: {$gt: 0},
            isTrashed: false
        })
            .sort({numberOfVisits: -1})
            .limit(quantity)
            .exec(function (err, postsArray) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (postsArray.length == 0) {
                    consoleLogger(successLogger(module, "SuggestedPosts is empty"));
                    //will call success with the empty postsArray
                    preparePostTagsToClient(null, null, [], true, success);
                } else {
                    consoleLogger(successLogger(module));
                    //will call success with the postsArray
                    preparePostTagsToClient(null, null, postsArray, true, success);
                }
            });
    },


    getHotThisWeek: function (quantity, error_neg_1, error_0, success) {
        var module = 'getHotThisWeek';
        receivedLogger(module);
        Post.find({
            numberOfVisits: {$gt: 0},
            isTrashed: false
        })
            .sort({numberOfVisits: -1})
            .limit(quantity)
            .exec(function (err, hotThisWeekArray) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1(-1, err);
                } else if (hotThisWeekArray.length == 0) {
                    consoleLogger(successLogger(module, "HotThisWeek is empty"));
                    //will call success with the empty postsArray
                    preparePostTagsToClient(null, null, [], true, success);
                } else {
                    consoleLogger(successLogger(module));
                    //will call success with the hotThisWeekArray
                    preparePostTagsToClient(null, null, hotThisWeekArray, true, success);
                }
            });
    },

    makeNewPost: function (req, res, postObject, success) {
        var module = 'makeNewPost';
        receivedLogger(module);
        var theUser = getTheUser(req);
        //will call success with the post with serialized tags
        preparePostTagsToDatabase(postObject, true, null, null, doneTags);

        function doneTags(newPostObject) {
            postObject = newPostObject;

            var post = new Post({
                postUniqueCuid: cuid(),
                //postIndex: taken care by auto-increment
                authorUniqueCuid: theUser.uniqueCuid,
                authorName: theUser.firstName + " " + theUser.lastName,
                authorUsername: theUser.username,
                authorEmail: theUser.email,
                postHeading: postObject.postHeading,
                postContent: postObject.postContent,
                postSummary: postObject.postSummary,
                postTags: postObject.postTags,
                postUploads: postObject.postUploads
            });
            consoleLogger(successLogger(module));
            success(post);
        }
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
        //will call success with the post with serialized tags
        preparePostTagsToDatabase(postObject, true, null, null, doneTags);

        function doneTags(newPostObject) {
            postObject = newPostObject;

            var post = {
                postIndex: postObject.postIndex,
                postUniqueCuid: postObject.postUniqueCuid,
                authorUniqueCuid: theUser.uniqueCuid,
                authorName: theUser.firstName + " " + theUser.lastName,
                authorUsername: theUser.username,
                authorEmail: theUser.email,
                postHeading: postObject.postHeading,
                postContent: postObject.postContent,
                postSummary: postObject.postSummary,
                postTags: postObject.postTags,
                postUploads: postObject.postUploads
            };
            consoleLogger(successLogger(module));
            success(post);
        }
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
                    thePost.postTags = postToUpdate.postTags;
                    thePost.postUploads = postToUpdate.postUploads;

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

    trashPost: function (req, res, postUniqueCuid, success) {
        var module = 'trashPost';
        receivedLogger(module);

        Post.findOne({postUniqueCuid: postUniqueCuid})
            .exec(function (err, thePost) {
                if (err) {
                    error('Failed to delete post, please try again');
                } else if (thePost == null || thePost == undefined || thePost.length == 0) {
                    error('The post was not found on the database');
                } else {
                    //update the post
                    thePost.isTrashed = true;

                    thePost.save(function (err, trashedPost) {
                        if (err) {
                            error('An error occurred, please try again.');
                        } else {
                            //this returns an object
                            consoleLogger(successLogger(module));
                            success(trashedPost);
                        }
                    });
                }
            });

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: errorMessage
            });
        }
    },

    unTrashPost: function (req, res, postUniqueCuid, success) {
        var module = 'unTrashPost';
        receivedLogger(module);

        Post.findOne({postUniqueCuid: postUniqueCuid})
            .exec(function (err, thePost) {
                if (err) {
                    error('Failed to remove post from trash, please try again.');
                } else if (thePost == null || thePost == undefined || thePost.length == 0) {
                    error('The post was not found on the database.');
                } else {
                    //update the post
                    thePost.isTrashed = false;

                    thePost.save(function (err, unTrashedPost) {
                        if (err) {
                            error('An error occurred, please try again.');
                        } else {
                            //this returns an object
                            consoleLogger(successLogger(module));
                            success(unTrashedPost);
                        }
                    });
                }
            });

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: errorMessage
            });
        }
    },

    deletePost: function (req, res, postUniqueCuid, success) {
        var module = 'deletePost';
        receivedLogger(module);

        Post.remove({postUniqueCuid: postUniqueCuid})
            .exec(function (err) {
                if (err) {
                    error('Failed to delete post, please try again.');
                } else {
                    consoleLogger(successLogger(module));
                    success();
                }
            });

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: errorMessage
            });
        }
    },

    getCount: function (error_neg_1, error_0, success) {
        var module = 'getCount';
        receivedLogger(module);
        var postCount;
        Post.count({
            isTrashed: false
        }, function (err, count) {
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

    //searchForPosts: function (queryString, quantity, page, resultObject, error_neg_1, error_0, success) {
    mainSearch: function (queryString, quantity, searchUniqueCuid, requestedPage, error_neg_1, error_0, success) {
        var module = 'mainSearch';
        receivedLogger(module);

        //this function parses the result object from database and spits out an object that contains the uniqueCuids of results,
        // the refined page, and the total count of searched items
        function parseSearchObject(theRequestedPage, resultDatabaseObject) {
            //the resultObject is an object whose keys are page numbers in tens, and value is
            //an array which contains the post references for the posts that match the query
            //inside the objects in the array, each has 2 keys: score and obj == post
            var returnValue = {
                queryString: queryString,
                postUniqueCuids: [],
                page: theRequestedPage,
                totalResults: resultDatabaseObject.resultObject.totalResults,
                searchUniqueCuid: resultDatabaseObject.searchUniqueCuid
            };

            //check to see if the given page number exceeds the total pages in the object
            if (theRequestedPage > resultDatabaseObject.resultObject.lastPage) {
                returnValue.page = resultDatabaseObject.resultObject.lastPage;
            }

            //check to see if the given page numberis negative
            if (theRequestedPage < 1) {
                returnValue.page = 1;
            }


            //place the uniqueCuids, using the corrected page
            resultDatabaseObject.resultObject[returnValue.page].forEach(function (post) {
                returnValue.postUniqueCuids.push(post.obj.postUniqueCuid);
            });
            return returnValue;
        }

        //===================1: If the browser provided a searchUniqueCuid, check to see if the searchUniqueCuid
        //exists, (WHICH MUST COINCIDE WITH THE QUERY STRING is so, retrieve the postSearchObject and parse
        if (searchUniqueCuid) {
            searchDB.getPostSearch(searchUniqueCuid, queryString, error_neg_1, searchObjectNotAvailable, searchObjectAvailable);
        } else {
            searchObjectNotAvailable();
        }

        function searchObjectAvailable(postSearchObject) {
            consoleLogger(successLogger(module, 'Search was available in post searches, RETURNING CACHED/CURSORED SEARCH'));
            var returnValue = parseSearchObject(requestedPage, postSearchObject);
            success(returnValue);
        }

        //===================2: if it does not exists, make a new search, save it, and parse it
        function searchObjectNotAvailable() {
            consoleLogger(successLogger(module, 'Search was not previously available, MAKING NEW SEARCH'));
            var options = {
                project: {
                    postUniqueCuid: 1,
                    postIndex: 1,
                    postHeading: 1,
                    postTags: 1
                },
                limit: quantity
            };

            Post.textSearch(queryString, options, function (err, output) {
                if (err) {
                    consoleLogger(errorLogger(module, 'textSearch', err));
                    error_neg_1(-1, err);
                } else {
                    //output is an object that contains 3 major keys:
                    //1:"results" = array of objects with 2 keys: "score" and "object" <--carries the post
                    //2:"stats" = result metadata containing: nscanned (number), nscannedObjects(number), n(number), timeMicros(number)
                    //3:"ok" == 1 if search went well

                    //prepare an object that contains pages and postUniqueCuids of the current search results: 10 post uniqueCuids for each page key
                    var resultObject = {};
                    var page = 1;
                    var len = output.results.length;

                    //check to see that there are results
                    if (len > 0) {
                        for (var i = 0, j = 1; i < len; i++, j++) {
                            if (j > 10) {
                                page++;
                                j = 1;
                            }
                            //check to see if the page property exists first
                            if (!resultObject[page]) {
                                resultObject[page] = []
                            }
                            //push the result
                            resultObject[page].push(output.results[i]);
                        }
                    } else {
                        //means the results are empty
                        resultObject[page] = [];
                    }

                    //push the number of pages and total results into the result object
                    resultObject['lastPage'] = page;
                    resultObject['totalResults'] = output.stats.n;

                    //make the new postSearch pointer
                    searchDB.makeNewPostSearch(queryString, resultObject, made);

                    //save it
                    function made(rawPostSearchObject) {
                        searchDB.saveNewPostSearch(rawPostSearchObject, error_neg_1, error_neg_1, saved);
                    }

                    function saved(savedPostSearchObject) {
                        var returnValue = parseSearchObject(requestedPage, savedPostSearchObject);
                        consoleLogger(successLogger(module));
                        success(returnValue);
                    }
                }
            });
        }

    }
};
