angular.module('indexApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals) {

            $scope.indexPageUrl = globals.allData.indexPageUrl;

            //register error handler error handler
            $rootScope.responseStatusHandler = function (resp) {
                $filter('responseFilter')(resp);
            };

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

            //this important function broadcasts the availability of the users data to directives that require
            //it e.g. the account status directive
            $scope.broadcastUserData = function () {
                $rootScope.$broadcast('userDataChanges');
            };

            $scope.clientIsRegistered = false;

            //variable that holds the account status
            $scope.accountStatusIsGood = false;

            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        $scope.broadcastUserData();

                        //important isRegistered variable
                        $scope.clientIsRegistered = $scope.userData.isRegistered;
                        $scope.accountStatusIsGood = $scope.checkAccountStatus($scope.userData);

                        if ($scope.userData.isRegistered) {
                            //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                            socket.emit('joinRoom', {
                                room: resp.userData.uniqueCuid
                            });
                        }
                        $rootScope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.responseStatusHandler(errResponse);
                    });
            }

            initialRequests();

            //===============socket listeners===============

            $rootScope.$on('reconnectSuccess', function () {
                initialRequests();
            });
        }
    ]);