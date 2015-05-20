angular.module('adminHomeApp')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', '$interval', 'socket',
        function ($filter, $http, $window, $rootScope, $interval, socket) {

            var post = {};
            var editPostModel = {};
            var posts = [];
            var postsCount = 0;
            var mainSearchResultsPosts = [];
            var suggestedPosts = [];

            socket.on('newPost', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('newPost', data);
            });

            socket.on('postUpdate', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('postUpdate', data);
            });

            return {

                getCurrentPosts: function () {
                    return posts;
                },

                getCurrentPostsCount: function () {
                    return postsCount;
                },

                getPostsFromServer: function (pageNumber) {
                    return $http.post('/api/getPosts', {
                        page: pageNumber
                    })
                },

                updatePosts: function (postsArray) {
                    if (postsArray == []) {
                        posts = [];
                    } else {
                        posts = $filter('preparePosts')(null, postsArray);
                    }
                    return posts;
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
                    posts.unshift(tempPost);
                    return posts;
                },

                getCurrentPost: function () {
                    return post;
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
                        post = $filter('preparePosts')(newPost, null);
                    }
                    return post;
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
                        editPostModel = newPost;
                    }
                    return editPostModel;
                },

                getCurrentMainSearchResults: function () {
                    return mainSearchResultsPosts;
                },

                mainSearch: function (searchObject) {
                    return $http.post('/api/mainSearch', searchObject);
                },

                updateMainSearchResults: function (resultValue) {
                    mainSearchResultsPosts = resultValue;
                    return mainSearchResultsPosts;
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
                        suggestedPosts = $filter('preparePosts')(null, suggestedPostsArray);
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