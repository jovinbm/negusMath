angular.module('clientHomeApp')
    .directive('postStream', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/post_feed.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                globals.defaultDocumentTitle();

                $scope.posts = PostService.getCurrentPosts();
                $scope.postsCount = PostService.getCurrentPostsCount();

                function getPagePosts() {
                    PostService.getPostsFromServer($rootScope.$stateParams.pageNumber || 1)
                        .success(function (resp) {
                            //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
                            //used if the user is accessing a page that is beyond the number of posts
                            if (resp.postsArray.length > 0) {
                                $scope.posts = PostService.updatePosts(resp.postsArray, $rootScope.$stateParams.pageNumber || 1);
                                $rootScope.main.goToTop();
                                if (resp.postsCount) {
                                    $scope.postsCount = PostService.updatePostsCount(resp.postsCount);
                                }
                            } else {
                                //empty the postsArray
                                $scope.posts = PostService.updatePosts([]);
                                $rootScope.main.goToTop();

                                var responseMimic = {
                                    banner: true,
                                    bannerClass: 'alert alert-dismissible alert-success',
                                    msg: "No more posts to show"
                                };
                                $rootScope.main.responseStatusHandler(responseMimic);
                            }
                        })
                        .error(function (errResp) {
                            $rootScope.main.responseStatusHandler(errResp);
                            $scope.posts = PostService.updatePosts([]);
                            $rootScope.main.goToTop();
                        });
                }

                getPagePosts();

                //===============socket listeners===============

                $rootScope.$on('newPost', function (event, data) {
                    //the new post is added into page 1 in postService
                    PostService.addNewToPosts(data.post);
                    if (data.postsCount) {
                        $scope.postsCount = PostService.updatePostsCount(data.postsCount);
                    }
                });

                $rootScope.$on('reconnect', function () {
                    if ($rootScope.$state.current.name == 'home' || $rootScope.$state.current.name == 'home.stream') {
                        getPagePosts();
                    }
                });
            }
        }
    }]);