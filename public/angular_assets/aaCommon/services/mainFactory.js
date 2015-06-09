angular.module('app')
    .factory('mainService', ['$log', '$window', '$rootScope', 'socket',
        function ($log, $window, $rootScope, socket) {

            socket.on('reconnect', function () {
                $log.info("'reconnect sequence' triggered");
                $rootScope.$broadcast('reconnect');
            });

            return {
                done: function () {
                    return 1;
                }
            };
        }
    ]);