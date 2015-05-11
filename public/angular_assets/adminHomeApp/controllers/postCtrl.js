angular.module('adminHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {

            //show paging
            $scope.showThePager();

            //change to default document title
            $scope.defaultDocumentTitle();

            $scope.posts = PostService.getCurrentPosts();
            $scope.postsCount = PostService.getCurrentPostsCount();

            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.mainSearchResultsPosts = false;
            $scope.showSuggestedPosts = false;

            $scope.showThePostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.mainSearchResultsPosts = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.mainSearchResultsPosts = false;
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
                $scope.showHideLoadingBanner(true);
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
                            $scope.showHideLoadingBanner(false);
                            $scope.finishedLoading();
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getPagePosts() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostsFromServer($rootScope.$stateParams.pageNumber)
                    .success(function (resp) {
                        //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
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
                            $scope.mainSearchResultsPosts = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
                            $scope.showThePostsOnly();
                            updateTimeAgo();
                            if (resp.postsCount) {
                                $scope.postsCount = resp.postsCount;
                                $scope.changePagingTotalCount($scope.postsCount);
                            }
                            //parse the posts and prepare them, eg, making iframes responsive
                            preparePostSummaryContent();
                            $scope.showThePager();
                            $scope.finishedLoading();
                        }
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.posts = [];
                        $scope.mainSearchResultsPosts = false;
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
                if ($rootScope.$stateParams.pageNumber == 1) {
                    $scope.posts.unshift(data.post);
                    updateTimeAgo();
                    preparePostSummaryContent();
                }
                if (data.postsCount) {
                    $scope.postsCount = data.postsCount;
                    $scope.changePagingTotalCount($scope.postsCount);
                }
            });

            $rootScope.$on('reconnect', function () {
                if ($scope.currentState == 'home') {
                    getPagePosts();
                }
            });

            $log.info('PostController booted successfully');

        }
    ])

    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {
            //hide paging
            $scope.hideThePager();

            $scope.postIndex = $stateParams.postIndex;
            $scope.post = {};
            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.showPost = false;
            $scope.showSuggestedPosts = false;

            $scope.showThePostOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.showPost = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.showPost = false;
                $scope.showSuggestedPosts = true;
            };

            $scope.postIsLoaded = false;

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                $scope.showHideLoadingBanner(true);
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
                            $scope.finishedLoading();
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToUniversalBanner();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getFullPost() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $scope.responseStatusHandler(resp);
                        //check that there is a post first before starting disqus and other attributes
                        if ($scope.calcObjectLength($scope.post) != 0) {

                            //change the document title
                            $scope.changeDocumentTitle($scope.post.postHeading);

                            $scope.showThePostOnly();
                            updateTimeAgo();
                            addPostUrl();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function preparePostContent() {
                                $scope.post.postContent = $scope.makeVideoIframesResponsive($scope.post.postContent);
                            }

                            preparePostContent();

                            //highlight the post if needed
                            $scope.highLightPost($scope.post);

                            //check first that this is a production env --> showDisqus before bootstrapping disqus
                            if ($scope.showDisqus) {
                                $scope.postIsLoaded = true;
                            }

                            $scope.hideThePager();
                            $scope.finishedLoading();

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
                $scope.post.postUrl = 'http://www.negusmath.com/#!/post/' + $scope.post.postIndex;
                //$scope.post.postUrl = 'http://' + $location.host() + '/#!/post/' + $scope.post.postIndex;
            }

            //==============end of update time ago

            //=============editing post====================

            //variable that holds the editing or show state in the full-post view.
            $scope.editingMode = false;

            //make copy of post, useful when the user clicks cancel
            $scope.postBackup = $scope.post;

            $scope.goIntoPostEditingMode = function () {
                //remove all the text highlights if available
                $scope.removePostHighlights($scope.post);
                $scope.hideThePager();

                //make copy of post, useful when the user clicks cancel
                $scope.postBackup = $scope.post;
                $scope.editingMode = true;
            };

            $scope.goIntoFullPostViewMode = function () {
                $scope.editingMode = false;
                $scope.hideThePager();
            };

            $scope.editPostHeadingLessMin = false;
            $scope.editPostContentIsEmpty = true;
            $scope.editPostSummaryIsEmpty = true;
            $scope.editPostSummaryHasExceededMaximum = false;

            $scope.checkIfEditPostHeadingLessMin = function () {
                if ($scope.post.postHeading) {
                    var postHeadingText = $scope.post.postHeading;
                    if (postHeadingText.length < 10) {
                        $scope.editPostHeadingLessMin = true;
                    }
                    else {
                        $scope.editPostHeadingLessMin = false;
                    }
                    return $scope.editPostHeadingLessMin
                } else {
                    return true;
                }
            };

            $scope.checkIfEditPostContentIsEmpty = function () {
                if ($scope.post.postContent) {
                    var postContentText = $("<div>" + $scope.post.postContent + "</div>").text();
                    if (postContentText.length == 0) {
                        $scope.editPostContentIsEmpty = true;
                    }
                    else {
                        $scope.editPostContentIsEmpty = false;
                    }
                    return $scope.editPostContentIsEmpty
                } else {
                    return true;
                }
            };

            $scope.checkIfEditPostSummaryIsEmpty = function () {
                if ($scope.post.postSummary) {
                    var editPostSummaryText = $("<div>" + $scope.post.postSummary + "</div>").text();
                    if (editPostSummaryText.length == 0) {
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
                    var editPostSummaryText = $("<div>" + $scope.post.postSummary + "</div>").text();
                    if (editPostSummaryText.length > maxLength) {
                        $scope.editPostSummaryHasExceededMaximum = true;
                    } else {
                        $scope.editPostSummaryHasExceededMaximum = false;
                    }
                    return $scope.editPostSummaryHasExceededMaximum
                } else {
                    return true;
                }
            };

            //returns true if tags pass validation
            $scope.checkEditPostTags = function () {
                var errorPostTags = 0;
                var numberOfTags = 0;

                $scope.post.postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (errorPostTags == 0) {
                        if (tag.text.length < 3 && errorPostTags == 0) {
                            errorPostTags++;
                            $scope.showToast('warning', 'Minimum allowed length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30 && errorPostTags == 0) {
                            errorPostTags++;
                            $scope.showToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5 && errorPostTags == 0) {
                    errorPostTags++;
                    $scope.showToast('warning', 'Only a maximum of 5 tags are allowed per post');
                }

                if (errorPostTags == 0) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.submitPostUpdate = function () {
                var errors = 0;

                //validate post heading
                if ($scope.checkIfEditPostHeadingLessMin() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The minimum required length of the heading is 10 characters');
                }

                //validatePostContent
                if ($scope.checkIfEditPostContentIsEmpty() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'Please add some text to the post first');
                }

                //validate postSummary
                if ($scope.checkIfEditPostSummaryIsEmpty() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The post summary cannot be empty');
                }

                if ($scope.checkEditPostSummaryMaxLength() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The post summary cannot exceed 2000 characters');
                }

                //validate tags
                //note that the edit post tags returns true if validation succeeded
                //it also shows toasts depending on whats missing
                if (!$scope.checkEditPostTags() && errors == 0) {
                    errors++;
                }

                if (errors == 0) {
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
                    if ($scope.currentState == 'post') {
                        getFullPost();
                    }
                }
            });

            $log.info('FullPostController booted successfully');

        }
    ]);