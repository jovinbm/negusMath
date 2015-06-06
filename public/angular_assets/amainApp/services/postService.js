angular.module('mainApp')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', 'socket', 'globals',
        function ($filter, $http, $window, $rootScope, socket, globals) {

            var post = {};
            var editPostModel = {};
            var allPosts = {};
            var allPostsCount = 0;
            var mainSearchResultsPosts = {};
            var mainSearchResultsPostsCount = 0;
            var suggestedPosts = {};
            var suggestedPostsCount = 0;

            socket.on('newPost', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('newPost', data);
            });

            socket.on('postUpdate', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('postUpdate', data);
            });

            return {

                getAllPosts: function () {
                    return allPosts;
                },

                getPosts: function (pageNumber) {
                    if (pageNumber) {
                        return allPosts[pageNumber];
                    } else {
                        return [];
                    }
                },

                getAllPostsCount: function () {
                    return allPostsCount;
                },

                getPostsFromServer: function (pageNumber) {
                    return $http.post('/api/getPosts', {
                        page: pageNumber
                    })
                },

                updatePosts: function (postsArray, pageNumber) {
                    if (postsArray == []) {
                        allPosts[pageNumber] = [];
                    } else {
                        allPosts[pageNumber] = $filter('preparePosts')(null, postsArray);
                    }
                    return allPosts[pageNumber];
                },

                removePostWithUniqueCuid: function (postUniqueCuid) {
                    var found = 0;
                    for (var pageNumber in allPosts) {
                        if (found == 0) {
                            if (allPosts.hasOwnProperty(pageNumber)) {
                                allPosts[pageNumber].forEach(function (post, index) {
                                    if (found == 0) {
                                        if (post.postUniqueCuid == postUniqueCuid) {
                                            allPosts[pageNumber].splice(index, 1);
                                            ++found;
                                        }
                                    }
                                });
                            }
                        }
                    }
                },

                updateAllPostsCount: function (newCount) {
                    allPostsCount = newCount;
                    return allPostsCount;
                },

                addNewToPosts: function (newPost) {
                    function makePost(theNewPost) {
                        if (newPost == {}) {
                            theNewPost = {}
                        } else {
                            theNewPost = $filter('preparePosts')(theNewPost, null);
                        }
                        return theNewPost;
                    }

                    var tempPost = makePost(newPost);
                    //unshift in firstPage
                    allPosts['1'].unshift(tempPost);
                    return allPosts;
                },

                getCurrentPost: function (postIndex) {
                    if (postIndex) {
                        return post[postIndex]
                    } else {
                        return {};
                    }
                },

                getPostFromServer: function (postIndex) {
                    return $http.post('/api/getPost', {
                        postIndex: postIndex
                    });
                },

                updatePost: function (newPost) {
                    if (newPost == {}) {
                        post = {}
                    } else {
                        post[newPost.postIndex] = $filter('preparePosts')(newPost, null);
                    }
                    return post[newPost.postIndex];
                },

                getCurrentEditPostModel: function () {
                    if (editPostModel == {}) {
                        return {}
                    } else {
                        return editPostModel;
                    }
                },

                getCurrentEditPostModelFromServer: function (postIndex) {
                    return $http.post('/api/getPost', {
                        postIndex: postIndex
                    });
                },

                updateCurrentEditPostModel: function (newPost) {
                    if (newPost == {}) {
                        editPostModel = {}
                    } else {
                        editPostModel = $filter('preparePostsNoChange')(newPost, null);
                    }
                    return editPostModel;
                },

                getAllMainSearchResults: function () {
                    return mainSearchResultsPosts;
                },

                getMainSearchResultsCount: function (pageNumber) {
                    return mainSearchResultsPostsCount[pageNumber];
                },

                mainSearch: function (searchObject) {
                    return $http.post('/api/mainSearch', searchObject);
                },

                updateMainSearchResults: function (resultsArray, pageNumber) {
                    if (resultsArray == []) {
                        mainSearchResultsPosts[pageNumber] = [];
                    } else {
                        mainSearchResultsPosts[pageNumber] = $filter('preparePosts')(null, resultsArray);
                    }
                    return mainSearchResultsPosts[pageNumber];
                },

                updateMainSearchResultsCount: function (newCount) {
                    mainSearchResultsPostsCount = newCount;
                    return mainSearchResultsPostsCount;
                },

                getSuggestedPosts: function () {
                    return suggestedPosts;
                },

                getSuggestedPostsFromServer: function () {
                    return $http.post('/api/getSuggestedPosts', {})
                },

                updateSuggestedPosts: function (suggestedPostsArray) {
                    if (suggestedPostsArray == []) {
                        suggestedPosts = [];
                    } else {
                        suggestedPosts = $filter('preparePostsNoChange')(null, suggestedPostsArray);
                    }
                    return suggestedPosts;
                },

                //admin actions

                submitNewPost: function (newPost) {
                    return $http.post('/api/newPost', {
                        newPost: newPost
                    });
                },

                submitPostUpdate: function (post) {
                    return $http.post('/api/updatePost', {
                        postUpdate: post
                    });
                },

                trashPost: function (postUniqueCuid) {
                    return $http.post('/api/trashPost', {
                        postUniqueCuid: postUniqueCuid
                    });
                },

                unTrashPost: function (postUniqueCuid) {
                    return $http.post('/api/unTrashPost');
                }
            };
        }
    ]);