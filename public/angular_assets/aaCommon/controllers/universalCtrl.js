angular.module('app')
    .controller('UniversalController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'socketService', 'globals', '$document',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, socketService, globals, $document) {

            //index page url
            $scope.indexPageUrl = globals.allData.indexPageUrl;

            //website host
            $rootScope.currentHost = globals.getLocationHost();

            //disqus
            $scope.showDisqus = $location.host().search("negusmath") !== -1;

            //scrolling functions
            var duration = 0; //milliseconds
            var offset = 40; //pixels; adjust for floating menu, context etc
            //Scroll to #some-id with 30 px "padding"
            //Note: Use this in a directive, not with document.getElementById

            $rootScope.main = {
                currentTime: "",

                showLoadingBannerDir: false,

                showLoadingBanner: function () {
                    this.showLoadingBannerDir = true;
                },

                hideLoadingBanner: function () {
                    this.showLoadingBannerDir = false;
                },

                goToTop: function () {
                    var someElement = angular.element(document.getElementById('top'));
                    $document.scrollToElement(someElement, 80, duration);
                },

                broadcastUserData: function () {
                    $rootScope.$broadcast('userDataChanges');
                },

                responseStatusHandler: function (resp) {
                    $filter('responseFilter')(resp);
                },

                clearBanners: function () {
                    $rootScope.$broadcast('clearBanners');
                },

                isLoading: true,

                startLoading: function () {
                    this.isLoading = true;
                },

                finishedLoading: function () {
                    $rootScope.isLoading = false;
                },

                redirectToPage: function (pathWithFirstSlash) {
                    $window.location.href = globals.getLocationHost() + pathWithFirstSlash;
                }

            };

            //=====================time functions=======================
            //set current Date
            $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            var updateCurrentTime = function () {
                $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            };
            $interval(updateCurrentTime, 20000, 0, true);

            //======================end time functions===================

            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
                        $scope.userData = globals.userData(resp.userData);
                        $rootScope.main.broadcastUserData();

                        if ($scope.userData.isRegistered) {
                            //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                            socket.emit('joinRoom', {
                                room: resp.userData.uniqueCuid
                            });
                        }
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    });
            }

            initialRequests();

            //$scope functions to be used in other controllers and directives
            //back navigation functionality
            var history = [];
            $rootScope.stateHistory = [];
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                history.push($location.$$path);
                //push the previous state also
                var temp = {};
                temp[fromState.name] = fromParams;
                $rootScope.stateHistory.push(temp);
            });

            $rootScope.back = function () {
                window.history.back();
            };

            $rootScope.backAngular = function () {
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.main.clearBanners();
                $rootScope.clearToasts();
            });

            //notification banner
            //$rootScope.showNotfBanner = function (type, text) {
            //    console.log(type + ' ' + text);
            //    switch (type) {
            //        case "success":
            //            notifications.showSuccess({
            //                message: text
            //            });
            //            break;
            //        case "warning":
            //            notifications.showWarning({
            //                message: text
            //            });
            //            break;
            //        case "error":
            //            notifications.showError({
            //                message: text
            //            });
            //            break;
            //        default:
            //        //clears current list of toasts
            //        //do nothing
            //    }
            //};

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                initialRequests();
            });
        }
    ]);