angular.module('indexApp')
    .directive('accountOuterScope', ['$rootScope', function ($rootScope, logoutService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //variable to hold state between local login and creating a new account
                //values =  signIn, register
                $scope.userLoginState = 'signIn';
                $scope.changeUserLoginState = function (newState) {
                    $scope.userLoginState = newState;
                };
            }
        }
    }]);