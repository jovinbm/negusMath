angular.module('adminHomeApp')
    .directive('userDisplay', ['$filter', '$rootScope', 'UserService', function ($filter, $rootScope, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/user_display.html',
            restrict: 'AE',
            scope: {
                user: '='
            },
            link: function ($scope, $element, $attrs) {
                //$scope.user included in scope

                $scope.isCollapsed = true;

                //user manipulation functions
                $scope.addAdminPrivileges = function (userUniqueCuid) {
                    UserService.addAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                };

                $scope.removeAdminPrivileges = function (userUniqueCuid) {
                    UserService.removeAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                };

                $scope.approveUser = function (userUniqueCuid) {
                    UserService.approveUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                };

                $scope.banUser = function (userUniqueCuid) {
                    UserService.banUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                };

                $scope.unBanUser = function (userUniqueCuid) {
                    UserService.unBanUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                };
            }
        }
    }]);