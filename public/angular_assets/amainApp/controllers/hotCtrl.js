angular.module('mainApp')
    .controller('PopularStoriesController', ['$q', '$log', '$scope', '$rootScope', 'PopularStoriesService', 'globals',
        function ($q, $log, $scope, $rootScope, PopularStoriesService, globals) {

            $scope.popularStories = PopularStoriesService.getPopularStories();

            function getPopularStories() {
                PopularStoriesService.getPopularStoriesFromServer()
                    .success(function (resp) {
                        $scope.popularStories = PopularStoriesService.updatePopularStories(resp.popularStories);
                    })
                    .error(function (errResp) {
                        $scope.popularStories = PopularStoriesService.updatePopularStories([]);
                        $rootScope.main.responseStatusHandler(errResp);
                    });
            }

            getPopularStories();

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                getPopularStories();
            });
        }
    ]);