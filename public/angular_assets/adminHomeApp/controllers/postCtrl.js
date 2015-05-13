angular.module('adminHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, fN) {

            $scope.showThePager();
            globals.defaultDocumentTitle();

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
                            $scope.suggestedPosts = $filter('makeVideoIframesResponsive')(null, $scope.suggestedPosts);
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToTop();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToTop();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $rootScope.responseStatusHandler(errResp);
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
                            $rootScope.responseStatusHandler(responseMimic);
                            $scope.mainSearchResultsPosts = false;
                            getSuggestedPosts();
                            $scope.goToTop();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
                            $scope.posts = $filter('makeVideoIframesResponsive')(null, $scope.posts);

                            $scope.showThePostsOnly();


                            if (resp.postsCount) {
                                $scope.postsCount = resp.postsCount;
                                $scope.changePagingTotalCount($scope.postsCount);
                            }
                            $scope.showThePager();
                        }
                    })
                    .error(function (errResp) {
                        $rootScope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.posts = [];
                        $scope.mainSearchResultsPosts = false;
                        getSuggestedPosts();
                    });
            }

            getPagePosts();

            //===============socket listeners===============

            $rootScope.$on('newPost', function (event, data) {
                //newPost goes to page 1, so update only if the page is 1
                if ($rootScope.$stateParams.pageNumber == 1) {
                    data.post = $filter('makeVideoIframesResponsive')(data.post, null);
                    $scope.posts.unshift(data.post);
                }
                if (data.postsCount) {
                    $scope.postsCount = data.postsCount;
                    $scope.changePagingTotalCount($scope.postsCount);
                }
            });

            $rootScope.$on('reconnect', function () {
                if ($rootScope.$state.current.name == 'home') {
                    getPagePosts();
                }
            });
        }
    ])

    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams, fN) {
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
                            $scope.suggestedPosts = $filter('makeVideoIframesResponsive')(null, $scope.suggestedPosts);
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToTop();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToTop();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $rootScope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getFullPost() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $rootScope.responseStatusHandler(resp);
                        if (fN.calcObjectLength($scope.post) != 0) {
                            $scope.post = $filter('makeVideoIframesResponsive')($scope.post, null);
                            $scope.post = $filter('AddPostUrl')($scope.post, null);
                            globals.changeDocumentTitle($scope.post.postHeading);
                            //check that there is a post first before starting disqus and other attributes
                            $scope.showThePostOnly();

                            //check first that this is a production env --> showDisqus before bootstrapping disqus
                            if ($scope.showDisqus) {
                                $scope.postIsLoaded = true;
                            }

                            $scope.hideThePager();

                        } else {
                            //empty the post
                            $scope.post = {};
                            $scope.showPost = false;
                            getSuggestedPosts();
                            $scope.goToTop();
                        }

                    })
                    .error(function (errResponse) {
                        $rootScope.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.post = {};
                        $scope.showPost = false;
                        getSuggestedPosts();
                    });
            }

            getFullPost();

            //=============editing post====================

            //variable that holds the editing or show state in the full-post view.
            $scope.editingMode = false;

            //make copy of post, useful when the user clicks cancel
            $scope.postBackup = $scope.post;

            $scope.goIntoPostEditingMode = function () {
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
                            $rootScope.showToast('warning', 'Minimum allowed length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30 && errorPostTags == 0) {
                            errorPostTags++;
                            $rootScope.showToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5 && errorPostTags == 0) {
                    errorPostTags++;
                    $rootScope.showToast('warning', 'Only a maximum of 5 tags are allowed per post');
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
                    $rootScope.showToast('warning', 'The minimum required length of the heading is 10 characters');
                }

                //validatePostContent
                if ($scope.checkIfEditPostContentIsEmpty() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'Please add some text to the post first');
                }

                //validate postSummary
                if ($scope.checkIfEditPostSummaryIsEmpty() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'The post summary cannot be empty');
                }

                if ($scope.checkEditPostSummaryMaxLength() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'The post summary cannot exceed 2000 characters');
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
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                }
            };

            $scope.cancelPostUpdate = function () {
                $scope.post = $scope.postBackup;
                $scope.goIntoFullPostViewMode();
                $rootScope.showToast('success', 'Update cancelled');
            };

            //end of editing post functions================

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                    data.post = $filter('makeVideoIframesResponsive')(data.post, null);
                    $scope.post = data.post;
                }
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                if (!$scope.editingMode) {
                    if ($rootScope.$state.current.name == 'post') {
                        getFullPost();
                    }
                }
            });
        }
    ]);