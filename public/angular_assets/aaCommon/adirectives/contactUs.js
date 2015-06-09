angular.module('app')
    .directive('contactUsScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
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
                        $rootScope.main.showToast('warning', "Please enter your name");
                        return -1
                    } else if (!email || email.length == 0) {
                        ++errors;
                        $rootScope.main.showToast('warning', "Please enter a valid email");
                        return -1
                    } else if (!message || message.length == 0) {
                        ++errors;
                        $rootScope.main.showToast('warning', "Message field is empty");
                        return -1;
                    } else if (errors == 0) {
                        return 1;
                    }
                }

                $scope.sendContactUs = function () {
                    var formStatus = validateContactUs($scope.contactUsModel.name, $scope.contactUsModel.email, $scope.contactUsModel.message);
                    if (formStatus == 1) {
                        sendContactUs($scope.contactUsModel)
                            .success(function (resp) {
                                $scope.contactUsModel.name = "";
                                $scope.contactUsModel.email = "";
                                $scope.contactUsModel.message = "";
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                            });
                    }
                };

                function sendContactUs(contactUsModel) {
                    return $http.post('/contactUs', contactUsModel);
                }
            }
        }
    }])
    .directive('contactUs', [function () {
        return {
            templateUrl: 'views/all/partials/components/contact_us.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //depends on contactUsScope
            }
        }
    }]);