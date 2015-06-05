angular.module('mainApp')
    .directive('allUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/all_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.allUsersModel = {
                    filterString: ""
                };

                $scope.allUsers = UserService.getAllUsers();

                function getAllUsers() {
                    if (globals.checkAccountStatus()) {
                        UserService.getAllUsersFromServer()
                            .success(function (resp) {
                                $scope.allUsers = UserService.updateAllUsers(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
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