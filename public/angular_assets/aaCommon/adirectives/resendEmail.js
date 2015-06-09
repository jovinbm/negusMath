angular.module('app')
    .directive('resendEmailScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    console.log(userUniqueCuid);
                    resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                        })
                };

                function resendConfirmationEmail(userUniqueCuid) {
                    return $http.post('/resendConfirmationEmail', {
                        userUniqueCuid: userUniqueCuid
                    });
                }
            }
        }
    }]);