angular.module('adminHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {

            $scope.posts = PostService.getCurrentPosts();
            $scope.postsCount = PostService.getCurrentPostsCount();

            function getPagePosts() {
                PostService.getPostsFromServer($stateParams.pageNumber)
                    .success(function (resp) {
                        $scope.posts = PostService.updatePosts(resp.postsArray);
                        updateTimeAgo();
                        $scope.postsCount = resp.postsCount;

                        //this function also creates a banner to notify user that there are no posts by mimicing a response and calling the response handler
                        //used if the user is accessing a page that is beyond the number of posts
                        if ($scope.posts.length == 0) {
                            var responseMimic = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "No more posts to show"
                            };
                            $scope.responseStatusHandler(responseMimic);
                            $scope.goToUniversalBanner();
                        }
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
                    });
            }

            getPagePosts();

            //this functions evaluates to true if object is not empty, useful for ng-show
            //this function also creates a banner to notify user that there are no posts by mimicing a response and calling the response handler
            $scope.checkIfPostsIsEmpty = function () {
                return $scope.posts.length == 0
            };

            //=============function to update timeago on all posts
            //updates the timeago on all incoming orders using the timeago filter
            function updateTimeAgo() {
                $scope.posts.forEach(function (post) {
                    post.theTimeAgo = $filter('timeago')(post.createdAt);

                    //post date/time it was ordered e.g. Sun, Mar 17..
                    post.postDate = moment(post.createdAt).format("ddd, MMM D, H:mm");
                });
            }

            $interval(updateTimeAgo, 120000, 0, true);

            //==============end of update time ago

            updateTimeAgo();

            //===============socket listeners===============

            $rootScope.$on('newPost', function (event, data) {
                //newPost goes to page 1, so update only if the page is 1
                if ($stateParams.pageNumber == 1) {
                    $scope.posts.unshift(data.post);
                    updateTimeAgo();
                }
                $scope.postCount = data.postCount;
            });

            $rootScope.$on('reconnect', function () {
                getPagePosts();
            });

            $log.info('PostController booted successfully');

        }
    ])

    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {
            $scope.postIndex = $stateParams.postIndex;
            $scope.post = {};
            $scope.postIsLoaded = false;

            //this functions evaluates to true if object is not empty, useful for ng-show
            $scope.checkIfPostIsEmpty = function () {
                return $scope.calcObjectLength($scope.post) == 0
            };

            function getFullPost() {
                PostService.getPostFromServer($scope.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $scope.responseStatusHandler(resp);
                        //check that there is a post first before starting disqus and other attributes
                        if ($scope.calcObjectLength($scope.post) != 0) {
                            updateTimeAgo();
                            addPostUrl();
                            $scope.postIsLoaded = true;

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function preparePostContent() {
                                $scope.post.postContent = $scope.makeVideoIframesResponsive($scope.post.postContent);
                            }

                            preparePostContent();

                        } else {
                            $scope.goToUniversalBanner();
                        }

                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            }

            getFullPost();

            //=============function to update timeago on this post
            function updateTimeAgo() {
                $scope.post.theTimeAgo = $filter('timeago')($scope.post.createdAt);

                //post date/time it was ordered e.g. Sun, Mar 17..
                $scope.post.postDate = moment($scope.post.createdAt).format("ddd, MMM D, H:mm");
            }

            $interval(updateTimeAgo, 120000, 0, true);

            function addPostUrl() {
                $scope.post.postUrl = 'http://' + $location.host() + '/adminHome.html#!/post/' + $scope.post.postIndex;
            }

            //==============end of update time ago

            //=============editing post====================

            //variable that holds the editing or show state in the full-post view.
            $scope.editingMode = false;

            //make copy of post, useful when the user clicks cancel
            $scope.postBackup = $scope.post;

            $scope.goIntoPostEditingMode = function () {
                //make copy of post, useful when the user clicks cancel
                $scope.postBackup = $scope.post;
                $scope.editingMode = true;
            };

            $scope.goIntoFullPostViewMode = function () {
                $scope.editingMode = false;
            };

            $scope.submitPostUpdate = function () {
                if ($scope.post.postContent.length == 0) {
                    $scope.showToast('warning', 'Please add some content to the post first');
                } else {
                    PostService.submitPostUpdate($scope.post)
                        .success(function (resp) {
                            $scope.goIntoFullPostViewMode();
                            $scope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.responseStatusHandler(errResponse);
                        })
                }
            };

            $scope.cancelPostUpdate = function () {
                $scope.post = $scope.postBackup;
                $scope.goIntoFullPostViewMode();
                $scope.showToast('success', 'Update cancelled');
            };

            //end of editing post functions================

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                $scope.post = data.post;
                updateTimeAgo();
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                if (!$scope.editingMode) {
                    getFullPost();
                }
            });

            $log.info('FullPostController booted successfully');

        }
    ]);