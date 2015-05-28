angular.module('indexApp')
    .directive('universalSearchBox', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {
            templateUrl: 'views/admin/partials/smalls/universal_search_box.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.mainSearchModel = {
                    queryString: "",
                    postSearchUniqueCuid: "",
                    requestedPage: 1
                };

                $scope.fillSearchBox = function () {
                    //check latest state
                    if ($rootScope.$state.current.name == 'search') {
                        $scope.mainSearchModel.queryString = $rootScope.$stateParams.queryString ? $rootScope.$stateParams.queryString : "";
                    } else if ($rootScope.stateHistory.length > 0) {
                        if ($rootScope.stateHistory[$rootScope.stateHistory.length - 1].hasOwnProperty('search')) {
                            //checking the previous state
                            $scope.mainSearchModel.queryString = $rootScope.stateHistory[$rootScope.stateHistory.length - 1]['search'].queryString
                        } else {
                            $scope.mainSearchModel.queryString = "";
                        }
                    } else {
                        $scope.mainSearchModel.queryString = "";
                    }
                };

                $scope.fillSearchBox();

                $scope.performMainSearch = function () {
                    if ($scope.mainSearchModel.queryString.length > 0) {
                        if ($location.port()) {
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/#!/search/" + $scope.mainSearchModel.queryString + "/1";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/#!/search/" + $scope.mainSearchModel.queryString + "/1";
                        }
                    }
                };
            }
        }
    }])
    .directive('topNav', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {

            templateUrl: 'views/index/views/top_nav.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutService.logoutClient()
                        .success(function (resp) {
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }])
    .directive('mainFooter', [function () {
        return {
            templateUrl: 'views/general/smalls/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('contactUs', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            templateUrl: 'views/general/smalls/contact_us.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.contactUsModel = {
                    name: "",
                    email: "",
                    message: ""
                };

                function validateContactUs(name, email, message) {
                    var errors = 0;

                    if (!name || name.length == 0) {
                        ++errors;
                        $rootScope.showToast('warning', "Please enter your name");
                        return -1
                    } else if (!email || email.length == 0) {
                        ++errors;
                        $rootScope.showToast('warning', "Please enter a valid email");
                        return -1
                    } else if (!message || message.length == 0) {
                        ++errors;
                        $rootScope.showToast('warning', "Message field is empty");
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
                                $rootScope.responseStatusHandler(resp);
                            })
                            .error(function (errResp) {
                                $rootScope.responseStatusHandler(errResp);
                            });
                    }
                };
            }
        }
    }]);