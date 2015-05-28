angular.module('adminHomeApp')
    .controller('HotController', ['$q', '$log', '$scope', '$rootScope', 'HotService',
        function ($q, $log, $scope, $rootScope, HotService) {

            $scope.hotThisWeek = HotService.getHotThisWeek();

            function getHotThisWeek() {
                HotService.getHotThisWeekFromServer()
                    .success(function (resp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek(resp.hotThisWeek);
                    })
                    .error(function (errResp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek([]);
                        $rootScope.main.responseStatusHandler(errResp);
                    });
            }

            getHotThisWeek();

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                getHotThisWeek();
            });
        }
    ]);