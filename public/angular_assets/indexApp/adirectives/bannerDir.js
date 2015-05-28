angular.module('indexApp')
    .directive('accountStatusBanner', ['$rootScope', 'socketService', 'globals', '$location', '$window', function ($rootScope, socketService, globals, $location, $window) {
        return {
            scope: {},
            templateUrl: 'views/general/smalls/account_status.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.accountStatusBanner = {
                    show: false,
                    bannerClass: "",
                    msg: "",
                    showResendEmail: false
                };

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    socketService.resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.responseStatusHandler(err);
                        })
                };


                //initial requests
                function getAccountDetails() {
                    socketService.getUserData()
                        .success(function (resp) {
                            $scope.theUser = resp.userData;
                            if (resp.userData.isRegistered == true) {
                                $scope.accountStatusBanner = determineAccountStatus(resp.userData);
                            }
                        })
                        .error(function () {
                            $scope.accountStatusBanner = {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "An error has occurred. Please reload page"
                            };
                        });
                }

                getAccountDetails();

                function determineAccountStatus(userData) {
                    if (userData.isRegistered) {
                        if (!userData.emailIsConfirmed) {
                            return {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "Please confirm your account by clicking the confirmation link we sent on your email. Please also check your spam folder",
                                showResendEmail: true
                            };
                        } else if (userData.isApproved === false) {
                            return {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved.",
                                showResendEmail: false
                            };
                        } else if (userData.isBanned) {
                            if (userData.isBanned.status === true) {
                                //checking banned status
                                return {
                                    show: true,
                                    bannerClass: "alert alert-warning",
                                    msg: "Your have been banned from this service. Please contact the administrators for more information",
                                    showResendEmail: false
                                };
                            } else {
                                return {
                                    show: false,
                                    bannerClass: "",
                                    msg: "",
                                    showResendEmail: false
                                };
                            }
                        } else {
                            return {
                                show: false,
                                bannerClass: "",
                                msg: "",
                                showResendEmail: false
                            };
                        }
                    } else {
                        return {
                            show: false,
                            bannerClass: "",
                            msg: "",
                            showResendEmail: false
                        };
                    }
                }

                $rootScope.$on('userDataChanges', function () {
                });

                $rootScope.$on('reconnect', function () {
                    getAccountDetails();
                });
            }
        }
    }])
    .directive('signInBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/index/smalls/sign_in_banner.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.signInBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('signInBanner', function (event, banner) {
                    $scope.signInBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.signInBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }])
    .directive('registrationBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/index/smalls/registration_banner.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.registrationBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('registrationBanner', function (event, banner) {
                    $scope.registrationBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.registrationBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }])
    .directive('toastrDirective', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.showToast = function (toastType, text) {
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

                $rootScope.clearToasts = function () {
                    toastr.clear();
                };
            }
        }
    }])
    .directive('loadingBanner', ['$rootScope', function ($rootScope) {
        var controller = ['$scope', '$rootScope', 'cfpLoadingBar', function ($scope, $rootScope, cfpLoadingBar) {

            $rootScope.isLoading = false;
            $rootScope.isLoadingPercentage = 0;
            $rootScope.changeIsLoadingPercentage = function (num) {
                $rootScope.isLoadingPercentage = num;
            };

            //hides or shows the loading splash screen
            $rootScope.showHideLoadingBanner = function (bool) {
                if (bool) {
                    $('#loading-splash-card').removeClass('hidden');
                    $('.hideMobileLoading').addClass('hidden-xs hidden-sm');
                } else {
                    $('#loading-splash-card').addClass('hidden');
                    $('.hideMobileLoading').removeClass('hidden-xs hidden-sm');
                }
            };

            $rootScope.$on('cfpLoadingBar:loading', function (event, resp) {
                $rootScope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:loaded', function (event, resp) {
                $rootScope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:completed', function (event, resp) {
                $rootScope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.isLoadingTrue = function () {
                $rootScope.isLoading = true;
            };
            $rootScope.isLoadingFalse = function () {
                $rootScope.isLoading = false;
            };

            $rootScope.$on('isLoadingTrue', function () {
                $rootScope.isLoading = true;
            });

            $rootScope.$on('isLoadingFalse', function () {
                $rootScope.isLoading = false;
            });
        }];

        return {
            templateUrl: 'views/client/partials/smalls/loading_banner.html',
            restrict: 'AE',
            controller: controller
        }
    }]);