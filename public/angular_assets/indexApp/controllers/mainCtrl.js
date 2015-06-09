angular.module('app')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals) {

            //function that determines if it's okay for the user to proceed
            $scope.checkAccountStatus = function (userData) {
                if (userData) {
                    if (userData.isRegistered) {
                        if (userData.emailIsConfirmed == false) {
                            return false;
                        } else {
                            if (userData.isApproved === false) {
                                return false
                            } else if (userData.isBanned) {
                                if (userData.isBanned.status === true) {
                                    //checking banned status
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

            //variable that holds the account status
            $scope.accountStatusIsGood = false;

            $rootScope.$on('userDataChanges', function () {
                $scope.accountStatusIsGood = $scope.checkAccountStatus(globals.userData);
            });
        }
    ]);