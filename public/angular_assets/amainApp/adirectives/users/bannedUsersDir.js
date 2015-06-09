angular.module('app')
    .directive('bannedUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/banned_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.bannedUsersModel = {
                    filterString: ""
                };

                $scope.bannedUsers = UserService.getBannedUsers();

                function getBannedUsers() {
                    if (globals.checkAccountStatus()) {
                        UserService.getBannedUsersFromServer()
                            .success(function (resp) {
                                $scope.bannedUsers = UserService.updateBannedUsers(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                }

                getBannedUsers();

                $rootScope.$on('userChanges', function () {
                    getBannedUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);