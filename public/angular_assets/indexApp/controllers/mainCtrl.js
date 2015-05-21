angular.module('indexApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals) {

            $scope.indexPageUrl = globals.allData.indexPageUrl;

            //register error handler error handler
            $rootScope.responseStatusHandler = function (resp) {
                $filter('responseFilter')(resp);
            };

            $scope.clientIsRegistered = true;

            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        $scope.clientIsRegistered = $scope.userData.isRegistered;

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

            socket.on('joined', function () {
                console.log("JOIN SUCCESS");
            });

            initialRequests();


            //===============socket listeners===============

            $rootScope.$on('reconnectSuccess', function () {
            });
        }
    ]);