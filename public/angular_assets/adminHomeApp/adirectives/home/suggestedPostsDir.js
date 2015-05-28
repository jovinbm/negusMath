angular.module('adminHomeApp')
    .directive('suggestedPosts', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/suggested_posts.html',
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
                                //empty the suggestedPosts
                                $scope.suggestedPosts = [];
                            }

                        })
                        .error(function (errResp) {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = PostService.updateSuggestedPosts([]);
                            $rootScope.main.responseStatusHandler(errResp);
                        });
                }

                getSuggestedPosts();
            }
        }
    }]);