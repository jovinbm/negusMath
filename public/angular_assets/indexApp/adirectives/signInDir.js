angular.module('indexApp')
    .directive('signIn', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            templateUrl: 'views/index/views/sign_in.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.loginFormModel = {
                    username: "",
                    password: ""
                };

                $scope.submitLocalLoginForm = function () {
                    socketService.localUserLogin($scope.loginFormModel)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.loginFormModel.password = "";
                            $rootScope.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }]);