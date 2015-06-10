angular.module('app')
    .directive('userDisplay', ['$rootScope', 'UserService', 'socketService', 'globals', function ($rootScope, UserService, socketService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/users/user_display.html',
            restrict: 'AE',
            scope: {
                user: '='
            },
            link: function ($scope, $element, $attrs) {
                //$scope.user included in scope

                $scope.isCollapsed = true;

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    socketService.resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                        })
                };

                //user manipulation functions
                $scope.addAdminPrivileges = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.addAdminPrivileges(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.removeAdminPrivileges = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.removeAdminPrivileges(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.approveUser = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.approveUser(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.banUser = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.banUser(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.unBanUser = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.unBanUser(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };
            }
        }
    }]);