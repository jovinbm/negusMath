angular.module('mainApp')
    .directive('postStreamScope', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.main.goToTop();

                globals.defaultDocumentTitle();
                $scope.allPosts = PostService.getAllPosts();
                $scope.allPostsCount = PostService.getAllPostsCount();

                function getPagePosts(pageNumber) {
                    //check if we have the posts cached, if so return them
                    if ($scope.allPosts.hasOwnProperty(pageNumber)) {
                        if ($scope.allPosts[pageNumber].length > 0) {
                        } else {
                            getFromServer(pageNumber);
                        }
                    } else {
                        getFromServer(pageNumber);
                    }

                    function getFromServer(pageNumber) {
                        PostService.getPostsFromServer(pageNumber)
                            .success(function (resp) {
                                //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
                                //used if the user is accessing a page that is beyond the number of posts
                                if (resp.postsArray.length > 0) {
                                    $scope.allPosts[pageNumber] = PostService.updatePosts(resp.postsArray, pageNumber);
                                    if (resp.postsCount) {
                                        $scope.allPostsCount = PostService.updateAllPostsCount(resp.postsCount);
                                    }
                                } else {
                                    //empty the postsArray
                                    $scope.allPosts[pageNumber] = PostService.updatePosts([], pageNumber);

                                    //var responseMimic = {
                                    //    banner: true,
                                    //    bannerClass: 'alert alert-dismissible alert-success',
                                    //    msg: "No more posts to show"
                                    //};
                                    //$rootScope.main.responseStatusHandler(responseMimic);
                                }
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                                $scope.allPosts[pageNumber] = PostService.updatePosts([], pageNumber);
                            });
                    }
                }

                $scope.showMore = function (pageNumber) {
                    getPagePosts(pageNumber);
                };
                getPagePosts(2);

                //===============socket listeners===============

                $rootScope.$on('newPost', function (event, data) {
                    PostService.addNewToPosts(data.post);
                    if (data.postsCount) {
                        $scope.allPostsCount = PostService.updateAllPostsCount(data.postsCount);
                    }
                });

                $rootScope.$on('reconnect', function () {
                    if ($rootScope.$state.current.name == 'home' || $rootScope.$state.current.name == 'home.stream') {
                        //getPagePosts();
                    }
                });
            }
        }
    }])
    .directive('postStream', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/all/partials/views/home/post_stream.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //post_stream depends on postStreamScope
            }
        }
    }]);