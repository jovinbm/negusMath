angular.module('mainApp')
    .directive('adminUsers', ['$q', '$log', '$rootScope', 'UserService', function ($q, $log, $rootScope, UserService) {
        return {
            templateUrl: 'views/all/partials/templates/admin_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.adminUsersModel = {
                    filterString: ""
                };
                $scope.adminUsers = UserService.getAdminUsers();

                function getAdminUsers() {
                    UserService.getAdminUsersFromServer()
                        .success(function (resp) {
                            $scope.adminUsers = UserService.updateAdminUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
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