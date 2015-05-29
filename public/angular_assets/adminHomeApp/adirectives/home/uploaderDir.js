angular.module('adminHomeApp')
    .directive('uploaderDirective', ['$rootScope', 'uploadService', function ($rootScope, uploadService) {
        return {

            templateUrl: 'views/general/smalls/simple_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.isUploading = false;
                $scope.uploads = [];
                $scope.uploading = {
                    show: false,
                    percent: 0
                };

                $scope.showUploading = function () {
                    $scope.isUploading = true;
                    $scope.uploading.percent = 0;
                    $scope.uploading.show = true;
                };

                $scope.hideProgressBars = function () {
                    $scope.isUploading = false;
                    $scope.uploading.show = false;
                };

                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                console.log(JSON.stringify(data.fileData));
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                };
            }
        }
    }]);