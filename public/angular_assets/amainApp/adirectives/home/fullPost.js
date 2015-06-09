angular.module('app')
    .directive('fullPostScope', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.main = {
                    post: PostService.getCurrentPost($rootScope.$stateParams.postIndex),
                    postIsLoaded: false,
                    isLoading: true,
                    startLoading: function () {
                        this.isLoading = true;
                    },
                    finishLoading: function () {
                        this.isLoading = false;
                    }
                };

                function getFullPost() {
                    $scope.main.startLoading();
                    PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            if (Object.keys(resp.thePost).length > 0) {
                                $scope.main.post = PostService.updatePost(resp.thePost);

                                //check first that this is a production env --> showDisqus before bootstrapping disqus
                                if ($scope.showDisqus) {
                                    $scope.main.postIsLoaded = true;
                                }
                            } else {
                                //empty the post
                                $scope.main.post = PostService.updatePost({});
                            }
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.post = PostService.updatePost({});
                        });
                    $scope.main.finishLoading();
                }

                getFullPost();

                //===============socket listeners===============

                $rootScope.$on('postUpdate', function (event, data) {
                    if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                        PostService.updatePost(data.post);
                    }
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);