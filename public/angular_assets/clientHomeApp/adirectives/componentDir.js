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
                    if ($rootScope.$state.current.name == 'search') {
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
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/#!/search/" + $scope.mainSearchModel.queryString + "/1";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/#!/search/" + $scope.mainSearchModel.queryString + "/1";
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
                        $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        $scope.pagingTotalCount = 1
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage});
                    $scope.goToTop();
                };
            }
        }
    }]);