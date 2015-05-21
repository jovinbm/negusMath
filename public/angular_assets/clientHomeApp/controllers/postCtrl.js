angular.module('clientHomeApp')
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
                    if ($rootScope.$state.current.name == 'home.post') {
                        getFullPost();
                    }
                }
            });
        }
    ]);