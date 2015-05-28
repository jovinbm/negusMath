angular.module('clientHomeApp')
    .directive('suggestedPosts', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.suggestedPosts = PostService.getSuggestedPosts();

                function getSuggestedPosts() {
                    PostService.getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if ((resp.postsArray.length > 0)) {
                                $scope.suggestedPosts = PostService.updateSuggestedPosts(resp.postsArray);
                                $rootScope.main.goToTop();
                            } else {
                                //empty the suggestedPosts
                                $scope.suggestedPosts = [];
                                $rootScope.main.goToTop();
                            }

                        })
                        .error(function (errResp) {
                            $rootScope.main.responseStatusHandler(errResp);
                            $scope.suggestedPosts = PostService.updateSuggestedPosts([]);
                            $rootScope.main.goToTop();
                        });
                }

                getSuggestedPosts();
            }
        }
    }]);