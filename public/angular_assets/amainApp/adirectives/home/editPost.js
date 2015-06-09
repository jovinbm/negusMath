angular.module('app')
    .directive('editPostDirectiveScope', ['$q', '$filter', '$log', '$window', '$location', '$rootScope', 'globals', 'PostService',
        function ($q, $filter, $log, $window, $location, $rootScope, globals, PostService) {
            return {
                restrict: 'AE',
                link: function ($scope, $element, $attrs) {

                    $scope.editPostModel = PostService.getCurrentEditPostModel();

                    function getFullEditPostModel() {
                        PostService.getCurrentEditPostModelFromServer($scope.postIndex)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                if (Object.keys(resp.thePost).length > 0) {
                                    $scope.editPostModel = PostService.updateCurrentEditPostModel(resp.thePost);
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
                        $rootScope.main.showToast('success', 'Update cancelled');
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
                        if ($scope.validateEditForm(true) && globals.checkAccountStatus()) {
                            PostService.submitPostUpdate($scope.editPostModel)
                                .success(function (resp) {
                                    $rootScope.main.responseStatusHandler(resp);
                                    $rootScope.main.redirectToPage('/post/' + resp.thePost.postIndex);
                                })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                })
                        }
                    };
                }
            }
        }
    ]);