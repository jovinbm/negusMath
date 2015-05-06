angular.module('searchApp')

    .factory('globals', ['$q', '$window', '$rootScope', 'socketService',
        function ($q, $window, $rootScope, socketService) {
            var userData = {};
            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                }
            };
        }]);