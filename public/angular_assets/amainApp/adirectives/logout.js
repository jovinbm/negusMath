angular.module('app')
    .directive('logoutScope', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutService.logoutClient()
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }]);