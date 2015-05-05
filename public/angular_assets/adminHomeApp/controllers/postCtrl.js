angular.module('adminHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {

            $scope.posts = PostService.getCurrentPosts();
            $scope.postsCount = PostService.getCurrentPostsCount();

            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.showPosts = false;
            $scope.showSuggestedPosts = false;

            $scope.showThePostsOnly = function () {
                $scope.showPosts = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showPosts = false;
                $scope.showSuggestedPosts = true;
            };

            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
            function preparePostSummaryContent() {
                $scope.posts.forEach(function (post) {
                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                });
            }

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                //empty the suggestedPosts
                $scope.suggestedPosts = [];
                PostService.getSuggestedPostsFromServer()
                    .success(function (resp) {
                        if ((resp.postsArray.length > 0)) {
                            $scope.showSuggestedPostsOnly();
                            $scope.suggestedPosts = resp.postsArray;
                            updateTimeAgo();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function prepareSuggestedPostsSummaryContent() {
                                $scope.suggestedPosts.forEach(function (post) {
                                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                                });
                            }

                            prepareSuggestedPostsSummaryContent();
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToUniversalBanner();
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });
            }

            function getPagePosts() {
                PostService.getPostsFromServer($stateParams.pageNumber)
                    .success(function (resp) {
                        //this function  creates a banner to notify user that there are no posts by mimicing a response and calling the response handler
                        //used if the user is accessing a page that is beyond the number of posts
                        if (resp.postsArray.length == 0) {

                            //empty the postsArray
                            $scope.posts = [];

                            var responseMimic = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "No more posts to show"
                            };
                            $scope.responseStatusHandler(responseMimic);
                            $scope.showPosts = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
                            $scope.showThePostsOnly();
                            updateTimeAgo();
                            if (resp.postCount) {
                                $scope.postsCount = resp.postsCount;
                            }
                            //parse the posts and prepare them, eg, making iframes responsive
                            preparePostSummaryContent();
                        }
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.posts = [];
                        $scope.showPosts = false;
                        getSuggestedPosts();
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
                    preparePostSummaryContent();
                }
                if (data.postCount) {
                    $scope.postCount = data.postCount;
                }
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
            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.showPost = false;
            $scope.showSuggestedPosts = false;

            $scope.showThePostOnly = function () {
                $scope.showPost = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showPost = false;
                $scope.showSuggestedPosts = true;
            };

            $scope.postIsLoaded = false;

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                //empty the suggestedPosts
                $scope.suggestedPosts = [];
                PostService.getSuggestedPostsFromServer()
                    .success(function (resp) {
                        if ((resp.postsArray.length > 0)) {
                            $scope.showSuggestedPostsOnly();
                            $scope.suggestedPosts = resp.postsArray;
                            updateTimeAgo();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function prepareSuggestedPostsSummaryContent() {
                                $scope.suggestedPosts.forEach(function (post) {
                                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                                });
                            }

                            prepareSuggestedPostsSummaryContent();
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToUniversalBanner();
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });
            }

            function getFullPost() {
                PostService.getPostFromServer($scope.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $scope.responseStatusHandler(resp);
                        //check that there is a post first before starting disqus and other attributes
                        if ($scope.calcObjectLength($scope.post) != 0) {
                            $scope.showThePostOnly();
                            updateTimeAgo();
                            addPostUrl();
                            $scope.postIsLoaded = true;

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function preparePostContent() {
                                $scope.post.postContent = $scope.makeVideoIframesResponsive($scope.post.postContent);
                            }

                            preparePostContent();

                        } else {
                            //empty the post
                            $scope.post = {};
                            $scope.showPost = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                        }

                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.post = {};
                        $scope.showPost = false;
                        getSuggestedPosts();
                    });
            }

            getFullPost();

            //=============function to update timeago on this post
            function updateTimeAgo() {
                if ($scope.post) {
                    $scope.post.theTimeAgo = $filter('timeago')($scope.post.createdAt);

                    //post date/time it was ordered e.g. Sun, Mar 17..
                    $scope.post.postDate = moment($scope.post.createdAt).format("ddd, MMM D, H:mm");
                }

                if ($scope.suggestedPosts) {
                    $scope.suggestedPosts.forEach(function (post) {
                        post.theTimeAgo = $filter('timeago')(post.createdAt);

                        //post date/time it was ordered e.g. Sun, Mar 17..
                        post.postDate = moment(post.createdAt).format("ddd, MMM D, H:mm");
                    });
                }
            }

            $interval(updateTimeAgo, 120000, 0, true);

            function addPostUrl() {
                $scope.post.postUrl = 'http://' + $location.host() + '/#!/post/' + $scope.post.postIndex;
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

            $scope.editPostSummaryIsEmpty = true;
            $scope.editPostSummaryHasExceededMaximum = false;

            $scope.checkIfEditPostSummaryIsEmpty = function () {
                if ($scope.post.postSummary) {
                    if ($scope.post.postSummary.length == 0) {
                        $scope.editPostSummaryIsEmpty = true;
                    }
                    else {
                        $scope.editPostSummaryIsEmpty = false;
                    }
                    return $scope.editPostSummaryIsEmpty
                } else {
                    return true;
                }

            };

            $scope.checkEditPostSummaryMaxLength = function (maxLength) {
                if ($scope.post.postSummary) {
                    if ($scope.post.postSummary.length > maxLength) {
                        $scope.editPostSummaryHasExceededMaximum = true;
                    } else {
                        $scope.editPostSummaryHasExceededMaximum = false;
                    }
                    return $scope.editPostSummaryHasExceededMaximum
                } else {
                    return true;
                }
            };

            $scope.submitPostUpdate = function () {
                if ($scope.post.postContent.length == 0) {
                    $scope.showToast('warning', 'Please add some content to the post first');
                } else if ($scope.post.postSummary.length > 1600) {
                    $scope.showToast('warning', 'The post summary cannot exceed 1600 characters');
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