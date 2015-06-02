angular.module('clientHomeApp')
    .directive('suggestedPosts', ['$rootScope', 'PostService', '$timeout', function ($rootScope, PostService, $timeout) {
        return {
            templateUrl: 'views/general/smalls/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.suggestedPosts = PostService.getSuggestedPosts();
                $rootScope.main.goToTop();

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

                $timeout(getSuggestedPosts, 5000);
            }
        }
    }]);