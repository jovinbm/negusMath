angular.module('indexApp', [
    'ui.bootstrap',
    'angular-loading-bar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngAnimate'
])
    .run(function ($templateCache, $http) {
        //views

        //partials
        //partials->navs
        //partials->modals
    });

angular.module('indexApp')
    .filter("timeago", function () {
        //time: the time
        //local: compared to what time? default: now
        //raw: whether you want in a format of "5 minutes ago", or "5 minutes"
        return function (time, local, raw) {
            if (!time) return "never";

            if (!local) {
                (local = Date.now())
            }

            if (angular.isDate(time)) {
                time = time.getTime();
            } else if (typeof time === "string") {
                time = new Date(time).getTime();
            }

            if (angular.isDate(local)) {
                local = local.getTime();
            } else if (typeof local === "string") {
                local = new Date(local).getTime();
            }

            if (typeof time !== 'number' || typeof local !== 'number') {
                return;
            }

            var
                offset = Math.abs((local - time) / 1000),
                span = [],
                MINUTE = 60,
                HOUR = 3600,
                DAY = 86400,
                WEEK = 604800,
                MONTH = 2629744,
                YEAR = 31556926,
                DECADE = 315569260;

            if (offset <= MINUTE)              span = ['', raw ? 'now' : 'less than a minute'];
            else if (offset < (MINUTE * 60))   span = [Math.round(Math.abs(offset / MINUTE)), 'min'];
            else if (offset < (HOUR * 24))     span = [Math.round(Math.abs(offset / HOUR)), 'hr'];
            else if (offset < (DAY * 7))       span = [Math.round(Math.abs(offset / DAY)), 'day'];
            else if (offset < (WEEK * 52))     span = [Math.round(Math.abs(offset / WEEK)), 'week'];
            else if (offset < (YEAR * 10))     span = [Math.round(Math.abs(offset / YEAR)), 'year'];
            else if (offset < (DECADE * 100))  span = [Math.round(Math.abs(offset / DECADE)), 'decade'];
            else                               span = ['', 'a long time'];

            span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
            span = span.join(' ');

            if (raw === true) {
                return span;
            }
            return (time <= local) ? span + ' ago' : 'in ' + span;
        }
    });



angular.module('indexApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService) {


            //===============request error handler===============

            //universalDisable variable is used to disable everything crucial in case an error
            //occurs.This is sometimes needed if a reload did not work
            $scope.universalDisable = false;
            $scope.showBanner = false;
            $scope.bannerClass = "";
            $scope.bannerMessage = "";

            $scope.showRegistrationBanner = false;
            $scope.registrationBannerClass = "";
            $scope.registrationBannerMessage = "";

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

            //initial requests
            function initialRequests() {
                $scope.isLoadingTrue();
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        if ($scope.userData.isRegistered == 'yes') {
                            $scope.clientIsRegistered = true;
                        } else {
                            $scope.clientIsRegistered = false;
                        }

                        if ($scope.userData.isRandomClient) {
                            $scope.isRandomClient = true;
                        } else {
                            $scope.isRandomClient = false;
                        }

                        //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                        socket.emit('joinRoom', {
                            room: resp.userData.uniqueCuid
                        });

                        $scope.responseStatusHandler(resp);
                        $scope.isLoadingFalse();
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                        $scope.isLoadingFalse();
                    });
            }

            socket.on('joined', function () {
                console.log("JOIN SUCCESS");
            });

            initialRequests();


            //variable to hold state between local login and creating a new account
            //values =  signIn, register
            $scope.userLoginState = 'signIn';
            $scope.changeUserLoginState = function (newState) {
                $scope.userLoginState = newState;
            };

            //===============THE LOCAL LOGIN FORM===============

            $scope.loginFormModel = {
                username: "",
                password: ""
            };

            $scope.submitLocalLoginForm = function () {
                socketService.localUserLogin($scope.loginFormModel)
                    .success(function (resp) {
                        //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $scope.loginFormModel.password = "";
                        $scope.responseStatusHandler(errResponse);
                    });
            };

            //===============END OF LOCAL LOGIN FORM FUNCTIONS===============

            //===============REGISTRATION FORM===============
            //===============registration details and functions===============
            $scope.registrationDetails = {
                email: "",
                firstName: "",
                lastName: "",
                username: "",
                password1: "",
                password2: "",
                invitationCode: ""
            };

            $scope.createAccount = function () {
                socketService.createAccount($scope.registrationDetails)
                    .success(function (resp) {
                        //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {

                        $scope.registrationDetails.password1 = "";
                        $scope.registrationDetails.password2 = "";
                        $scope.registrationDetails.invitationCode = "";
                        $scope.responseStatusHandler(errResponse);
                    });
            };
            //===============END OF REGISTRATION FORM===============

            //===============contact us form===============
            $scope.contactUsModel = {
                name: "",
                email: "",
                message: ""
            };

            function validateContactUs(name, email, message) {
                var errors = 0;

                if (!name || name.length == 0) {
                    ++errors;
                    $scope.showToast('warning', "Please enter your name");
                    return -1
                } else if (!email || email.length == 0) {
                    ++errors;
                    $scope.showToast('warning', "Please enter a valid email");
                    return -1
                } else if (!message || message.length == 0) {
                    ++errors;
                    $scope.showToast('warning', "Message field is empty");
                    return -1;
                } else if (errors == 0) {
                    return 1;
                }
            }

            $scope.sendContactUs = function () {
                var formStatus = validateContactUs($scope.contactUsModel.name, $scope.contactUsModel.email, $scope.contactUsModel.message);
                if (formStatus == 1) {
                    socketService.sendContactUs($scope.contactUsModel)
                        .success(function (resp) {
                            $scope.contactUsModel.name = "";
                            $scope.contactUsModel.email = "";
                            $scope.contactUsModel.message = "";
                            $scope.responseStatusHandler(resp);
                        })
                        .error(function (errResp) {
                            $scope.responseStatusHandler(errResp);
                        });
                }
            };

            //===============end of contactUs===============

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

            $rootScope.$on('reconnectSuccess', function () {
            });

            $log.info('MainController booted successfully');

        }
    ]);
angular.module('indexApp')

    .factory('globals', ['$window', '$rootScope', 'socketService',
        function ($window, $rootScope, socketService) {
            var userData = {};
            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                }
            };
        }]);
angular.module('indexApp')
    .factory('mainService', ['$log', '$window', '$rootScope', 'socket', 'socketService', 'globals',
        function ($log, $window, $rootScope, socket, socketService, globals) {

            socket.on('reconnect', function () {
                $log.info("'reconnect sequence' triggered");
                $rootScope.$broadcast('reconnectSuccess');
            });

            return {
                done: function () {
                    return 1;
                }
            };
        }]);
angular.module('indexApp')

    .factory('socket', ['$log', '$location', '$rootScope',
        function ($log, $location, $rootScope) {
            var url;
            if ($location.port()) {
                url = $location.host() + ":" + $location.port();
            } else {
                url = $location.host();
            }
            var socket = io.connect(url);
            //return socket;
            return {
                on: function (eventName, callback) {
                    socket.on(eventName, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                },

                emit: function (eventName, data, callback) {
                    socket.emit(eventName, data, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    });
                },

                removeAllListeners: function (eventName, callback) {
                    socket.removeAllListeners(eventName, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                }
            };
        }])


    .factory('socketService', ['$log', '$http', '$rootScope',
        function ($log, $http, $rootScope) {

            return {

                getUserData: function () {
                    return $http.get('/api/getUserData');
                },

                createAccount: function (details) {
                    return $http.post('/createAccount', details);
                },

                localUserLogin: function (loginData) {
                    return $http.post('/localUserLogin', loginData);
                },

                sendContactUs: function (contactUsModel) {
                    return $http.post('/contactUs', contactUsModel);
                }
            }
        }
    ])

    .factory('logoutService', ['$http',
        function ($http) {
            return {

                logoutClient: function () {
                    return $http.post('/api/logoutClient');
                }
            }
        }]);