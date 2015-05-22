angular.module('adminHomeApp')
    .directive('bannedUsers', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'UserService', function ($q, $filter, $log, $interval, $window, $location, $rootScope, socket, mainService, socketService, globals, $modal, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/banned_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.bannedUsersModel = {
                    filterString: ""
                };

                $scope.bannedUsers = UserService.getBannedUsers();

                function getBannedUsers() {
                    UserService.getBannedUsersFromServer()
                        .success(function (resp) {
                            $scope.bannedUsers = UserService.updateBannedUsers(resp.usersArray);
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
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