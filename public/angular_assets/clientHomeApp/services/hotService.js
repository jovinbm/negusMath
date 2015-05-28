angular.module('clientHomeApp')
    .factory('HotService', ['$filter', '$log', '$rootScope', 'socket','$http',
        function ($filter, $log, $rootScope, socket, $http) {

            var hotThisWeek = [];

            socket.on('hotThisWeekPosts', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('hotThisWeekPosts', data);
            });

            return {

                getHotThisWeek: function () {
                    return hotThisWeek;
                },

                getHotThisWeekFromServer: function () {
                    return $http.post('/api/getHotThisWeek', {})
                },

                updateHotThisWeek: function (hotThisWeekArray) {
                    if (hotThisWeekArray == []) {
                        hotThisWeek = [];
                    } else {
                        hotThisWeek = $filter('preparePostsNoChange')(null, hotThisWeekArray);
                    }
                    return hotThisWeekArray;
                }
            };
        }]);