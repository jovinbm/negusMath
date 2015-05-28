angular.module('clientHomeApp')
    .factory('mainService', ['$log', '$rootScope', 'socket',
        function ($log, $rootScope, socket) {

            socket.on('reconnect', function () {
                $log.info("'reconnect sequence' triggered");
                $rootScope.$broadcast('reconnect');
            });

            return {
                done: function () {
                    return 1;
                }
            };
        }]);