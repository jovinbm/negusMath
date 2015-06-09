angular.module('app')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', 'socket', 'globals',
        function ($filter, $http, $window, $rootScope, socket, globals) {

            var post = {};
            var editPostModel = {};
            var allPosts = {};
            var allPostsCount = 0;

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

                getPostsFromServer: function (getModelObject) {
                    var pageNumber = getModelObject.requestedPage;
                    History.pushState(null, null, "/posts?page=" + parseInt(pageNumber));
                    return $http.get('/partial/posts?page=' + parseInt(pageNumber));
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

                postSearch: function (searchObject) {
                    var queryString = searchObject.queryString;
                    var pageNumber = searchObject.requestedPage;
                    History.pushState(null, null, "/search/posts?q=" + queryString + '&page=' + parseInt(pageNumber));
                    return $http.get('/partial/search/posts?q=' + queryString + '&page=' + parseInt(pageNumber));
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