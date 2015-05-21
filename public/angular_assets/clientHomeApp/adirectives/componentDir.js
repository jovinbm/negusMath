angular.module('clientHomeApp')
    .directive('titleDirective', ['globals', function (globals) {
        return {
            template: '<title ng-bind="defaultTitle">' + '</title>',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.defaultTitle = globals.getDocumentTitle();
                $scope.$watch(globals.getDocumentTitle, function () {
                    $scope.defaultTitle = globals.getDocumentTitle();
                });
            }
        }
    }])
    .directive('universalSearchBox', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {
            templateUrl: 'views/client/partials/smalls/universal_search_box.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.mainSearchModel = {
                    queryString: "",
                    postSearchUniqueCuid: "",
                    requestedPage: 1
                };

                $scope.fillSearchBox = function () {
                    //check latest state
                    if ($rootScope.$state.current.name == 'home.search') {
                        $scope.mainSearchModel.queryString = $rootScope.$stateParams.queryString ? $rootScope.$stateParams.queryString : "";
                    } else if ($rootScope.stateHistory.length > 0) {
                        if ($rootScope.stateHistory[$rootScope.stateHistory.length - 1].hasOwnProperty('search')) {
                            //checking the previous state
                            $scope.mainSearchModel.queryString = $rootScope.stateHistory[$rootScope.stateHistory.length - 1]['search'].queryString
                        } else {
                            $scope.mainSearchModel.queryString = "";
                        }
                    } else {
                        $scope.mainSearchModel.queryString = "";
                    }
                };

                $scope.fillSearchBox();

                $scope.performMainSearch = function () {
                    if ($scope.mainSearchModel.queryString.length > 0) {
                        if ($location.port()) {
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/#!/home/search/" + $scope.mainSearchModel.queryString + "/1";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/#!/home/search/" + $scope.mainSearchModel.queryString + "/1";
                        }
                    }
                };
            }
        }
    }])
    .directive('topNav', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {

            templateUrl: 'views/client/partials/views/top_nav.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutService.logoutClient()
                        .success(function (resp) {
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }])
    .directive('postStream', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', function ($q, $filter, $log, $interval, $window, $location, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/post_feed.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
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
                    PostService.getPostsFromServer($rootScope.$stateParams.pageNumber || 1)
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
                    if ($rootScope.$state.current.name == 'home' || $rootScope.$state.current.name == 'home.stream') {
                        getPagePosts();
                    }
                });
            }
        }
    }])
    .directive('suggestedPosts', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.suggestedPosts = PostService.getSuggestedPosts();

                $scope.showSuggestedPosts = false;
                $rootScope.showHideSuggestedPosts = function (bool) {
                    if (bool) {
                        $scope.showSuggestedPosts = true;
                        //get new suggested posts
                        getSuggestedPosts();
                    } else {
                        $scope.showSuggestedPosts = false;
                    }
                };

                function getSuggestedPosts() {
                    $scope.showLoadingBanner();
                    PostService.getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if ((resp.postsArray.length > 0)) {
                                $scope.suggestedPosts = PostService.updateSuggestedPosts(resp.postsArray);
                                $scope.hideLoadingBanner();
                            } else {
                                //empty the suggestedPosts
                                $scope.suggestedPosts = [];
                                $scope.showSuggestedPosts = false;
                                $scope.goToTop();
                                $scope.hideLoadingBanner();
                            }

                        })
                        .error(function (errResp) {
                            $scope.goToTop();
                            //empty the suggestedPosts
                            $scope.suggestedPosts = PostService.updateSuggestedPosts([]);
                            $scope.showSuggestedPosts = false;
                            $rootScope.responseStatusHandler(errResp);
                            $scope.hideLoadingBanner();
                        });

                    //whatever happens, hide the pager
                    $scope.hideThePager();
                }

                getSuggestedPosts();
            }
        }
    }])
    .directive('pagerDirective', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {

            templateUrl: 'views/client/partials/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.showPaging = false;
                $rootScope.showThePager = function (bool) {
                    if (bool) {
                        $scope.showPaging = true;
                    } else {
                        $scope.showPaging = true;
                    }
                };
                $rootScope.hideThePager = function () {
                    $scope.showPaging = false;
                };
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $rootScope.changePagingTotalCount = function (newTotalCount) {
                    $scope.pagingTotalCount = newTotalCount;
                };

                $scope.currentPage = $rootScope.$stateParams.pageNumber;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //refresh the currentPage if the user is going to a new state
                    if (fromState.name != toState.name) {
                        if($rootScope.$state.current.name != 'home') {
                            $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        }
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    console.log($scope.currentPage);
                    if ($rootScope.$state.current.name == 'home') {
                        $rootScope.$state.go('home.stream', {pageNumber: $scope.currentPage});
                    } else {
                        $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage})
                    }
                    $scope.goToTop();
                };
            }
        }
    }])
    .directive('contactUs', ['globals', function (globals) {
        return {
            templateUrl: 'views/client/partials/smalls/contact_us.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('mainFooter', ['globals', function (globals) {
        return {
            templateUrl: 'views/client/partials/smalls/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);