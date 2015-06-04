angular.module('indexApp')
    .directive('resendEmailScope', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    console.log(userUniqueCuid);
                    socketService.resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.responseStatusHandler(err);
                        })
                };
            }
        }
    }]);