angular.module('indexApp')
    .directive('accountOuter', ['$rootScope', function ($rootScope, logoutService) {
        return {
            templateUrl: 'views/index/views/account_outer.html',
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