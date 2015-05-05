angular.module('clientHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$document', '$state', '$stateParams', 'logoutService', 'cfpLoadingBar',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $document, $state, $stateParams, logoutService, cfpLoadingBar) {

            //listens for state changes
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.currentState = toState.name;
            });

            //back functionality
            var history = [];
            $rootScope.$on('$routeChangeSuccess', function () {
                history.push($location.$$path);
            });
            $rootScope.back = function () {
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
            };

            //length of an object

            $scope.calcObjectLength = function (obj) {
                var len = 0;
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        len++;
                    }
                }
                return len
            };

            //end of object lengths

            //scrolling functions
            var duration = 0; //milliseconds
            var offset = 40; //pixels; adjust for floating menu, context etc
            //Scroll to #some-id with 30 px "padding"
            //Note: Use this in a directive, not with document.getElementById

            //scrolling to top
            $scope.goToTop = function () {
                var someElement = angular.element(document.getElementById('top'));
                $document.scrollToElement(someElement, 80, duration);
            };

            //scrolling to universal banner
            $scope.goToUniversalBanner = function () {
                var someElement = angular.element(document.getElementById('universalBanner'));
                $document.scrollToElement(someElement, 80, duration);
            };

            //making videos responsive
            $scope.makeVideoIframesResponsive = function (theElementString) {
                //convert the element to string
                var theElement = $("<div>" + theElementString + "</div>");

                //find the video iframe elements
                var imgElement = $('img.ta-insert-video', theElement);

                //only perform operation if there are iframes available
                if (imgElement.length > 0) {

                    //add class and wrap in div
                    var imgWrappedInDiv = imgElement
                        .addClass('embed-responsive-item')
                        .wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

                    //replace in original
                    theElement.find('img').replaceWith(imgWrappedInDiv);
                }

                return theElement.html();

            };

            //===============request error handler===============

            //universalDisable variable is used to disable everything crucial in case an error
            //occurs.This is sometimes needed if a reload did not work
            $scope.universalDisable = false;

            //universal banner
            $scope.showBanner = false;
            $scope.bannerClass = "";
            $scope.bannerMessage = "";

            //registration banner
            $scope.showRegistrationBanner = false;
            $scope.registrationBannerClass = "";
            $scope.registrationBannerMessage = "";

            //new post banner
            $scope.showNewPostBanner = false;
            $scope.newPostBannerClass = "";
            $scope.newPostBannerMessage = "";

            $scope.clearBanners = function () {
                $scope.showBanner = false;
                $scope.showRegistrationBanner = false;
                $scope.showNewPostBanner = false;
            };

            //clear banners when the state changes
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.clearBanners();
            });

            $scope.universalDisableTrue = function () {
                $scope.universalDisable = true;
            };
            $scope.universalDisableFalse = function () {
                $scope.universalDisable = false;
            };

            $scope.responseStatusHandler = function (resp) {
                if (resp) {
                    if (resp.redirect) {
                        if (resp.redirect) {
                            $window.location.href = resp.redirectPage;
                        }
                    }
                    if (resp.disable) {
                        if (resp.disable) {
                            $scope.universalDisableTrue();
                        }
                    }
                    if (resp.notify) {
                        if (resp.type && resp.msg) {
                            $scope.showToast(resp.type, resp.msg);
                        }
                    }
                    if (resp.banner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showBanner = true;
                            $scope.bannerClass = resp.bannerClass;
                            $scope.bannerMessage = resp.msg;
                        }
                    }
                    if (resp.newPostBanner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showNewPostBanner = true;
                            $scope.newPostBannerClass = resp.bannerClass;
                            $scope.newPostBannerMessage = resp.msg;
                        }
                    }
                    if (resp.registrationBanner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showRegistrationBanner = true;
                            $scope.registrationBannerClass = resp.bannerClass;
                            $scope.registrationBannerMessage = resp.msg;
                        }
                    }
                    if (resp.reason) {
                        $log.warn(resp.reason);
                    }
                } else {
                    //do nothing
                }
            };

            $rootScope.$on('responseStatusHandler', function (event, resp) {
                $scope.responseStatusHandler(resp);
            });


            //===============end of request error handler===============


            //===============isLoading functions to disable elements while content is loading or processing===============
            $scope.isLoading = false;
            $scope.isLoadingPercentage = 0;
            $scope.changeIsLoadingPercentage = function (num) {
                $scope.isLoadingPercentage = num;
            };

            $rootScope.$on('cfpLoadingBar:loading', function (event, resp) {
                $scope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:loaded', function (event, resp) {
                $scope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:completed', function (event, resp) {
                $scope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $scope.isLoadingTrue = function () {
                $scope.isLoading = true;
            };
            $scope.isLoadingFalse = function () {
                $scope.isLoading = false;
            };

            $rootScope.$on('isLoadingTrue', function () {
                $scope.isLoading = true;
            });

            $rootScope.$on('isLoadingFalse', function () {
                $scope.isLoading = false;
            });

            //===============end of isLoading functions===============

            //===============toastr show functions===============
            $scope.showToast = function (toastType, text) {
                switch (toastType) {
                    case "success":
                        toastr.clear();
                        toastr.success(text);
                        break;
                    case "warning":
                        toastr.clear();
                        toastr.warning(text, 'Warning', {
                            closeButton: true,
                            tapToDismiss: true
                        });
                        break;
                    case "error":
                        toastr.clear();
                        toastr.error(text, 'Error', {
                            closeButton: true,
                            tapToDismiss: true,
                            timeOut: false
                        });
                        break;
                    default:
                        //clears current list of toasts
                        toastr.clear();
                }
            };

            $rootScope.$on('showToast', function (event, data) {
                var toastType = data.toastType;
                var text = data.text;

                $scope.showToast(toastType, text);
            });

            //===============end of toastr show functions===============

            //************time functions****************
            $scope.currentTime = "";

            //set current Date
            $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            var updateCurrentTime = function () {
                $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            };
            $interval(updateCurrentTime, 20000, 0, true);

            //***************end time functions***********************

            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        if ($scope.userData.isRegistered == 'yes') {
                            $scope.clientIsRegistered = true;
                        } else {
                            $scope.clientIsRegistered = false;
                        }

                        if ($scope.userData.isRegistered == 'yes') {
                            //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                            socket.emit('joinRoom', {
                                room: resp.userData.uniqueCuid
                            });
                        }

                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            }

            socket.on('joined', function () {
                console.log("JOIN SUCCESS");
            });

            initialRequests();


            //function to go to landing page
            $scope.goToLandingPage = function () {
                $window.location.href = 'index';
            };

            //===============logout functions===============
            $scope.logoutClient = function () {
                logoutService.logoutClient()
                    .success(function (resp) {
                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            };

            //=============end of logout===================

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
            });

            $log.info('MainController booted successfully');

        }
    ]);