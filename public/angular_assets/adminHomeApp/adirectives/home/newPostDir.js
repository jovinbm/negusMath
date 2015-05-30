angular.module('adminHomeApp')
    .directive('newPostDirective', ['$filter', '$rootScope', 'PostService', function ($filter, $rootScope, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/new_post_full.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $rootScope.main.goToTop();

                $scope.newPostModel = {
                    postHeading: "",
                    postContent: "",
                    postSummary: "",
                    postTags: [],
                    postUploads: []
                };

                //broadcast here helps distinguish from the inform checking and the checking on submit, which requires notifications
                //broadcast takes a boolean value
                $scope.validateForm = function (notify) {
                    console.log(notify);
                    var errors = 0;
                    if (!$filter("validatePostHeading")($scope.newPostModel.postHeading, notify)) {
                        errors++;
                    }
                    if (errors == 0) {
                        if (!$filter("validatePostContent")($scope.newPostModel.postContent, notify)) {
                            errors++;
                        }
                    }
                    if (errors == 0) {
                        if (!$filter("validatePostSummary")($scope.newPostModel.postSummary, notify)) {
                            errors++;
                        }
                    }
                    if (errors == 0) {
                        if (!$filter("validatePostTags")($scope.newPostModel.postTags, notify)) {
                            errors++;
                        }
                    }
                    return errors == 0;
                };

                $scope.submitNewPost = function () {
                    if ($scope.validateForm(true)) {
                        var newPost = {
                            postHeading: $scope.newPostModel.postHeading,
                            postContent: $scope.newPostModel.postContent,
                            postSummary: $scope.newPostModel.postSummary,
                            postTags: $scope.newPostModel.postTags
                        };
                        PostService.submitNewPost(newPost).
                            success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.newPostModel.postHeading = "";
                                $scope.newPostModel.postContent = "";
                                $scope.newPostModel.postSummary = "";
                                $scope.newPostModel.postTags = [];
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $rootScope.main.goToTop();
                            })
                    } else {
                        $rootScope.main.goToTop();
                    }
                }
            }
        }
    }]);