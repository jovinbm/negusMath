angular.module('app')
    .directive('signInScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.loginFormModel = {
                    username: "",
                    password: ""
                };

                $scope.submitLocalLoginForm = function () {
                    localUserLogin($scope.loginFormModel)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function localUserLogin(loginData) {
                    return $http.post('/localUserLogin', loginData);
                }
            }
        }
    }]);