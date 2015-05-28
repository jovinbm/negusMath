angular.module('adminHomeApp')
    .controller('UserManagerController', ['$q', '$scope', '$rootScope', 'UserService',
        function ($q, $scope, $rootScope, UserService) {

            $rootScope.main.goToTop();

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                UserService.getUsersCountFromServer()
                    .success(function (resp) {
                        $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                        $rootScope.main.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    })
            }

            getUsersCount();

            //===============socket listeners===============

            $rootScope.$on('userChanges', function () {
                getUsersCount();
            });

            $rootScope.$on('reconnect', function () {
            });
        }
    ]);