angular.module('mainApp')
    .directive('titleDirective', ['globals', function (globals) {
        return {
            template: '<title ng-bind="defaultTitle">' + '</title>',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.defaultTitle = globals.getDocumentTitle();
                $scope.$watch(globals.getDocumentTitle, function () {
                    $scope.defaultTitle = globals.getDocumentTitle();
                });
            }
        }
    }])
    .directive('contactUs', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            templateUrl: 'views/all/partials/components/contact_us.html',
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
    }])
    .directive('mainFooter', [function () {
        return {
            templateUrl: 'views/all/partials/components/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);