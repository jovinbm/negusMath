angular.module('clientHomeApp')
    .directive('fullPost', ['$q', '$log', '$rootScope', 'globals', 'PostService', 'fN', function ($q, $log, $rootScope, globals, PostService, fN) {
        return {
            templateUrl: 'views/client/partials/smalls/post_full.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.post = PostService.getCurrentPost();

                $scope.postIsLoaded = false;

                function getFullPost() {
                    PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            if (fN.calcObjectLength(resp.thePost) != 0) {
                                $scope.post = PostService.updatePost(resp.thePost);
                                globals.changeDocumentTitle($scope.post.postHeading);
                                $rootScope.main.goToTop();

                                //check first that this is a production env --> showDisqus before bootstrapping disqus
                                if ($scope.showDisqus) {
                                    $scope.postIsLoaded = true;
                                }
                            } else {
                                //empty the post
                                $scope.post = PostService.updatePost({});
                                $rootScope.main.goToTop();
                            }

                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.post = PostService.updatePost({});
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
        }
    }]);