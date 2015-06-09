angular.module('app')
    .factory('PopularStoriesService', ['$filter', '$log', '$http', '$window', '$rootScope', 'socket',
        function ($filter, $log, $http, $window, $rootScope, socket) {

            var popularStories = [];

            return {

                getPopularStories: function () {
                    return popularStories;
                },

                getPopularStoriesFromServer: function () {
                    return $http.post('/api/getPopularStories', {})
                },

                updatePopularStories: function (popularStoriesArray) {
                    if (popularStoriesArray == []) {
                        popularStories = [];
                    } else {
                        popularStories = $filter('preparePostsNoChange')(null, popularStoriesArray);
                    }
                    return popularStoriesArray;
                }
            };
        }
    ]);