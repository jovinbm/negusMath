angular.module('adminHomeApp')
    .directive('postStreamPager', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {

            templateUrl: 'views/admin/partials/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $scope.$watch(PostService.getCurrentPostsCount, function (newValue, oldValue) {
                    $scope.pagingTotalCount = newValue;
                });

                $scope.currentPage = $rootScope.$stateParams.pageNumber;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //refresh the currentPage if the user is going to a new state
                    if (fromState.name != toState.name) {
                        if ($rootScope.$state.current.name != 'home') {
                            $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        }
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    if ($rootScope.$state.current.name == 'home') {
                        $rootScope.$state.go('home.stream', {pageNumber: $scope.currentPage});
                    } else {
                        $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage})
                    }
                };
            }
        }
    }])
    .directive('mainSearchResultsPager', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {

            templateUrl: 'views/admin/partials/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $scope.$watch(PostService.getCurrentMainSearchResultsCount, function (newValue, oldValue) {
                    $scope.pagingTotalCount = newValue;
                });

                $scope.currentPage = $rootScope.$stateParams.pageNumber;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //refresh the currentPage if the user is going to a new state
                    if (fromState.name != toState.name) {
                        if ($rootScope.$state.current.name != 'home') {
                            $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        }
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    if ($rootScope.$state.current.name == 'home') {
                        $rootScope.$state.go('home.stream', {pageNumber: $scope.currentPage});
                    } else {
                        $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage})
                    }
                };
            }
        }
    }]);