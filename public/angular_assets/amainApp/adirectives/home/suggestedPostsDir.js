angular.module('mainApp')
    .directive('suggestedPosts', ['$rootScope', 'PostService', '$timeout', 'globals', function ($rootScope, PostService, $timeout, globals) {
        return {
            templateUrl: 'views/all/partials/templates/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.main.goToTop();
                $scope.suggestedPosts = PostService.getSuggestedPosts();

                function getSuggestedPosts() {
                    PostService.getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if ((resp.postsArray.length > 0)) {
                                $scope.suggestedPosts = PostService.updateSuggestedPosts(resp.postsArray);
                            } else {
                                $scope.suggestedPosts = PostService.getSuggestedPosts();
                            }

                        })
                        .error(function (errResp) {
                            $scope.suggestedPosts = PostService.getSuggestedPosts();
                            $rootScope.main.responseStatusHandler(errResp);
                        });
                }

                getSuggestedPosts();
            }
        }
    }]);