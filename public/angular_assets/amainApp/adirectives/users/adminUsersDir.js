angular.module('app')
    .directive('adminUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/admin_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.adminUsersModel = {
                    filterString: ""
                };
                $scope.adminUsers = UserService.getAdminUsers();

                function getAdminUsers() {
                    if (globals.checkAccountStatus()) {
                        UserService.getAdminUsersFromServer()
                            .success(function (resp) {
                                $scope.adminUsers = UserService.updateAdminUsers(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                }

                getAdminUsers();

                $rootScope.$on('userChanges', function () {
                    getAdminUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);