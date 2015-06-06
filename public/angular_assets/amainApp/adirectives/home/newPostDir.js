angular.module('mainApp')
    .directive('newPostDirectiveScope', ['$filter', '$rootScope', 'PostService', 'globals', function ($filter, $rootScope, PostService, globals) {
        return {
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
                    if ($scope.validateForm(true) && globals.checkAccountStatus()) {
                        var newPost = {
                            postHeading: $scope.newPostModel.postHeading,
                            postContent: $scope.newPostModel.postContent,
                            postSummary: $scope.newPostModel.postSummary,
                            postTags: $scope.newPostModel.postTags,
                            postUploads: $scope.newPostModel.postUploads
                        };

                        PostService.submitNewPost(newPost).
                            success(function (resp) {
                                var thePost = resp.thePost;
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.newPostModel.postHeading = "";
                                $scope.newPostModel.postContent = "";
                                $scope.newPostModel.postSummary = "";
                                $scope.newPostModel.postTags = [];
                                $scope.newPostModel.postUploads = [];
                                $rootScope.main.redirectToPage('/post/' + thePost.postIndex);
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
    }])
    .directive('newPostDirective', ['$filter', '$rootScope', 'PostService', 'globals', function ($filter, $rootScope, PostService, globals) {
        return {
            templateUrl: 'views/all/partials/views/home/new_post.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //new_post depends on newPostDirectiveScope
            }
        }
    }]);