angular.module('clientHomeApp')
    .directive('accountStatusBanner', ['$rootScope', '$window', '$location', function ($rootScope, $window, $location) {
        return {
            templateUrl: 'views/general/smalls/account_status.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.accountStatusBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $scope.checkAccountStatus = function (userData) {
                    if (userData) {
                        if (userData.isRegistered) {
                            //checkApprovalStatus
                            if (userData.isApproved === false) {
                                return false
                            } else if (userData.isBanned) {
                                if (userData.isBanned.status === true) {
                                    //checking banned status
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                };

                function determineAccountStatus(userData) {
                    if (userData.isRegistered) {
                        //checkApprovalStatus
                        if (userData.isApproved === false) {
                            return {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved."
                            };
                        } else if (userData.isBanned) {
                            if (userData.isBanned.status === true) {
                                //checking banned status
                                return {
                                    show: true,
                                    bannerClass: "alert alert-warning",
                                    msg: "Your have been banned from this service. Please contact the administrators for more information"
                                };
                            } else {
                                return {
                                    show: false,
                                    bannerClass: "",
                                    msg: ""
                                };
                            }
                        } else {
                            return {
                                show: false,
                                bannerClass: "",
                                msg: ""
                            };
                        }
                    } else {
                        return {
                            show: false,
                            bannerClass: "",
                            msg: ""
                        };
                    }
                }

                $rootScope.$on('userDataChanges', function () {
                    $scope.accountStatusBanner = determineAccountStatus($scope.userData);

                    //if account status is not okay, redirect user to index
                    if (!$scope.checkAccountStatus($scope.userData)) {
                        if ($location.port()) {
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/index";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/index";
                        }
                    }
                });
            }
        }
    }])
    .directive('universalBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/client/partials/smalls/universal_banner.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.universalBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('universalBanner', function (event, banner) {
                    $scope.universalBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.universalBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }])
    .directive('newPostBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/client/partials/smalls/new_post_banner.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.newPostBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('newPostBanner', function (event, banner) {
                    $scope.newPostBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.newPostBanner = {
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

            $rootScope.isLoading = true;
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