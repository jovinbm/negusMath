angular.module('adminHomeApp')
    .controller('UserManagerController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService', 'UserService', '$document', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService, UserService, $document) {

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                UserService.getUsersCountFromServer()
                    .success(function (resp) {
                        $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                        $rootScope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.responseStatusHandler(errResponse);
                    })
            }

            getUsersCount();

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

            //===============socket listeners===============

            $rootScope.$on('userChanges', function () {
                getUsersCount();
            });

            $rootScope.$on('reconnect', function () {
            });
        }
    ]);