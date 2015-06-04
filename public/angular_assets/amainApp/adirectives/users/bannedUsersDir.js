angular.module('mainApp')
    .directive('bannedUsers', ['$q', '$log', '$rootScope', 'UserService', function ($q, $log, $rootScope, UserService) {
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
                    UserService.getBannedUsersFromServer()
                        .success(function (resp) {
                            $scope.bannedUsers = UserService.updateBannedUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
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