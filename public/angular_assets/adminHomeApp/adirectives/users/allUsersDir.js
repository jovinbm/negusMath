angular.module('adminHomeApp')
    .directive('allUsers', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'UserService', function ($q, $filter, $log, $interval, $window, $location, $rootScope, socket, mainService, socketService, globals, $modal, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/all_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.allUsersModel = {
                    filterString: ""
                };

                $scope.allUsers = UserService.getAllUsers();

                function getAllUsers() {
                    UserService.getAllUsersFromServer()
                        .success(function (resp) {
                            $scope.allUsers = UserService.updateAllUsers(resp.usersArray);
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                }

                getAllUsers();

                $rootScope.$on('userChanges', function () {
                    getAllUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);