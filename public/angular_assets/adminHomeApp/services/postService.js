angular.module('adminHomeApp')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', 'socket',
        function ($filter, $http, $window, $rootScope, socket) {

            var post = {};
            var editPostModel = {};
            var posts = {};
            var postsCount = 0;
            var mainSearchResultsPosts = [];
            var mainSearchResultsPostsCount = 0;
            var suggestedPosts = [];
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

                getCurrentPosts: function (pageNumber) {
                    if (pageNumber) {
                        return posts[pageNumber];
                    } else {
                        return [];
                    }
                },

                getCurrentPostsCount: function () {
                    return postsCount;
                },

                getPostsFromServer: function (pageNumber) {
                    return $http.post('/api/getPosts', {
                        page: pageNumber
                    })
                },

                updatePosts: function (postsArray, pageNumber) {
                    if (postsArray == []) {
                        posts[pageNumber] = [];
                    } else {
                        posts[pageNumber] = $filter('preparePosts')(null, postsArray);
                    }
                    return posts[pageNumber];
                },

                updatePostsCount: function (newCount) {
                    postsCount = newCount;
                    return postsCount;
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
                    posts['1'].unshift(tempPost);
                    return posts;
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

                getCurrentMainSearchResults: function () {
                    return mainSearchResultsPosts;
                },

                getCurrentMainSearchResultsCount: function () {
                    return mainSearchResultsPostsCount;
                },

                mainSearch: function (searchObject) {
                    return $http.post('/api/mainSearch', searchObject);
                },

                updateMainSearchResults: function (resultsArray) {
                    if (resultsArray == []) {
                        mainSearchResultsPosts = [];
                    } else {
                        mainSearchResultsPosts = $filter('preparePosts')(null, resultsArray);
                    }
                    return mainSearchResultsPosts;
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

                submitNewPost: function (newPost) {
                    return $http.post('/api/newPost', {
                        newPost: newPost
                    });
                },

                submitPostUpdate: function (post) {
                    return $http.post('/api/updatePost', {
                        postUpdate: post
                    });
                }
            };
        }]);