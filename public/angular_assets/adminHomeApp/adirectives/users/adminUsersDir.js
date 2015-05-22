angular.module('adminHomeApp')
    .directive('adminUsers', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'UserService', function ($q, $filter, $log, $interval, $window, $location, $rootScope, socket, mainService, socketService, globals, $modal, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/admin_users.html',
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
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
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