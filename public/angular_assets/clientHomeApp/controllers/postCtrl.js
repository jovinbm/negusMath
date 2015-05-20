angular.module('clientHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {

            $scope.showThePager();
            globals.defaultDocumentTitle();

            $scope.posts = PostService.getCurrentPosts();
            $scope.postsCount = PostService.getCurrentPostsCount();
            $scope.suggestedPosts = PostService.getSuggestedPosts();

            //variable that determines whether to show posts/suggested posts or not
            $scope.mainSearchResultsPosts = false;

            $scope.showThePostsOnly = function () {
                $scope.hideLoadingBanner();
                $scope.mainSearchResultsPosts = true;
                $scope.hideSuggested();
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.hideLoadingBanner();
                $scope.mainSearchResultsPosts = false;
                $scope.showSuggested();
            };

            function getPagePosts() {
                $scope.showLoadingBanner();
                PostService.getPostsFromServer($rootScope.$stateParams.pageNumber)
                    .success(function (resp) {
                        //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
                        //used if the user is accessing a page that is beyond the number of posts
                        if (resp.postsArray.length == 0) {

                            //empty the postsArray
                            $scope.posts = PostService.updatePosts([]);

                            var responseMimic = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "No more posts to show"
                            };
                            $rootScope.responseStatusHandler(responseMimic);
                            $scope.mainSearchResultsPosts = false;
                            $scope.showSuggestedPostsOnly();
                            $scope.goToTop();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
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
                        $scope.posts = PostService.updatePosts([]);
                        $scope.mainSearchResultsPosts = false;
                        $scope.showSuggestedPostsOnly();
                    });
            }

            getPagePosts();

            //===============socket listeners===============

            $rootScope.$on('newPost', function (event, data) {
                //newPost goes to page 1, so update only if the page is 1
                if ($rootScope.$stateParams.pageNumber == 1) {
                    $scope.posts = PostService.addNewToPosts(data.post);
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
            $scope.post = PostService.getCurrentPost();

            //variable that determines whether to show posts/suggested posts or not
            $scope.showEditPost = false;

            $scope.showThePostOnly = function () {
                $scope.hideLoadingBanner();
                $scope.showEditPost = true;
                $scope.hideSuggested();
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.hideLoadingBanner();
                $scope.showEditPost = false;
                $scope.showSuggested();
            };

            $scope.postIsLoaded = false;

            function getFullPost() {
                $scope.showLoadingBanner();
                PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $rootScope.responseStatusHandler(resp);
                        if (fN.calcObjectLength(resp.thePost) != 0) {
                            $scope.post = PostService.updatePost(resp.thePost);
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
                            $scope.post = PostService.updatePost({});
                            $scope.showEditPost = false;
                            $scope.showSuggestedPostsOnly();
                            $scope.goToTop();
                        }

                    })
                    .error(function (errResponse) {
                        $rootScope.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.post = PostService.updatePost({});
                        $scope.showEditPost = false;
                        $scope.showSuggestedPostsOnly();
                    });
            }

            getFullPost();

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                    $scope.post = PostService.updatePost(data.post);
                }
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                if (!$rootScope.isEditingPost) {
                    if ($rootScope.$state.current.name == 'post') {
                        getFullPost();
                    }
                }
            });
        }
    ]);