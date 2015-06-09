angular.module('app')
    .directive('logoutScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutClient()
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function logoutClient() {
                    return $http.post('/api/logoutClient');
                }
            }
        }
    }]);