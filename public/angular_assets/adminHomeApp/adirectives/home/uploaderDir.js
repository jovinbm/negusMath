angular.module('adminHomeApp')
    .directive('uploaderDirective', ['$rootScope', 'uploadService', function ($rootScope, uploadService) {
        return {

            templateUrl: 'views/general/smalls/simple_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.uploads = [];
                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {
                            'username': $scope.userData.firstName
                        };
                        uploadService.uploadPostImage(fields, file)
                            .success(function (data, status, headers, config) {
                                console.log(JSON.stringify(data.fileData));
                                $scope.uploads.push(data.fileData)
                            })
                            .error(function (errResponse) {
                                $rootScope.responseStatusHandler(errResponse);
                            });
                    }
                };
            }
        }
    }]);