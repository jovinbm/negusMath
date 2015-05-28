angular.module('indexApp')
    .directive('createAccount', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            templateUrl: 'views/index/views/create_account.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.registrationDetails = {
                    email: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password1: "",
                    password2: "",
                    invitationCode: ""
                };

                $scope.createAccount = function () {
                    socketService.createAccount($scope.registrationDetails)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {

                            $scope.registrationDetails.password1 = "";
                            $scope.registrationDetails.password2 = "";
                            $scope.registrationDetails.invitationCode = "";
                            $rootScope.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }]);