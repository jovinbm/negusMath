angular.module('mainApp')
    .controller('UserManagerController', ['$q', '$scope', '$rootScope', 'UserService', 'globals',
        function ($q, $scope, $rootScope, UserService, globals) {

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                if (globals.checkAccountStatus()) {
                    UserService.getUsersCountFromServer()
                        .success(function (resp) {
                            $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
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