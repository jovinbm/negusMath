angular.module('app')
    .directive('newPostUploader', ['$rootScope', 'uploadService', 'globals', function ($rootScope, uploadService, globals) {
        return {

            templateUrl: 'views/all/partials/templates/uploaders/new_post_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
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
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.newPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadPdf(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPdf(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.newPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadZip(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadZip(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.newPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }
            }
        }
    }])
    .directive('editPostUploader', ['$rootScope', 'uploadService', 'globals', function ($rootScope, uploadService, globals) {
        return {

            templateUrl: 'views/all/partials/templates/uploaders/edit_post_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
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
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.editPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadPdf(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPdf(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.editPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadZip(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadZip(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.editPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }
            }
        }
    }])
    .directive('uploaderDirective', ['$rootScope', 'uploadService', 'globals', function ($rootScope, uploadService, globals) {
        return {

            templateUrl: 'views/all/partials/templates/uploaders/simple_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

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
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadPdf(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPdf(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadZip(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadZip(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }
            }
        }
    }]);