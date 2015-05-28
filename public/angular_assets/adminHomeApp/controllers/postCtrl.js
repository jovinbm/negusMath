angular.module('adminHomeApp')
    .controller('EditPostController', ['$q', '$filter', '$log', '$window', '$location', '$scope', '$rootScope', 'globals', 'PostService', 'fN',
        function ($q, $filter, $log, $window, $location, $scope, $rootScope, globals, PostService, fN) {

            $rootScope.main.goToTop();

            $scope.editPostModel = PostService.getCurrentEditPostModel();

            function getFullEditPostModel() {
                PostService.getCurrentEditPostModelFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
                        if (fN.calcObjectLength(resp.thePost) != 0) {
                            $scope.editPostModel = PostService.updateCurrentEditPostModel(resp.thePost);
                            globals.changeDocumentTitle($scope.editPostModel.postHeading);
                        } else {
                            //empty the post
                            $scope.editPostModel = PostService.updateCurrentEditPostModel({});
                        }

                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.editPostModel = PostService.updateCurrentEditPostModel({});
                    });
            }

            getFullEditPostModel();

            $scope.cancelPostUpdate = function () {
                $rootScope.showToast('success', 'Update cancelled');
                if ($location.port()) {
                    $window.location.href = "http://" + $location.host() + ":" + $location.port() + $scope.editPostModel.postPath;
                } else {
                    $window.location.href = "http://" + $location.host() + $scope.editPostModel.postPath
                }
            };

            $scope.validateEditForm = function (notify) {
                var errors = 0;
                if (!$filter("validatePostHeading")($scope.editPostModel.postHeading, notify)) {
                    errors++;
                }
                if (errors == 0) {
                    if (!$filter("validatePostContent")($scope.editPostModel.postContent, notify)) {
                        errors++;
                    }
                }
                if (errors == 0) {
                    if (!$filter("validatePostSummary")($scope.editPostModel.postSummary, notify)) {
                        errors++;
                    }
                }
                if (errors == 0) {
                    if (!$filter("validatePostTags")($scope.editPostModel.postTags, notify)) {
                        errors++;
                    }
                }
                return errors == 0;
            };

            $scope.submitPostUpdate = function () {
                if ($scope.validateEditForm(true)) {
                    PostService.submitPostUpdate($scope.editPostModel)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            $rootScope.showToast('success', 'Saved');
                            if ($location.port()) {
                                $window.location.href = "http://" + $location.host() + ":" + $location.port() + $scope.editPostModel.postPath;
                            } else {
                                $window.location.href = "http://" + $location.host() + $scope.editPostModel.postPath
                            }
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
            };
        }
    ]);