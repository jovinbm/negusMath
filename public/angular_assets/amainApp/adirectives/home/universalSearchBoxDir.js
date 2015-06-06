angular.module('mainApp')
    .directive('universalSearchBoxScope', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.mainSearchModel = {
                    queryString: "",
                    requestedPage: 1
                };

                $scope.performMainSearch = function () {
                    if ($scope.mainSearchModel.queryString.length > 0) {
                        $rootScope.main.redirectToPage('/search/posts/' + $scope.mainSearchModel.queryString + '/' + $scope.mainSearchModel.requestedPage);
                    }
                };
            }
        }
    }]);