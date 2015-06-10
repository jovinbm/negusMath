angular.module('app')
    .directive('suggestedPosts', ['$rootScope', '$filter', '$http', function ($rootScope, $filter, $http) {
        return {
            templateUrl: 'views/all/partials/templates/suggested/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.suggestedPosts = [];
                $scope.suggestedPostsCount = 0;

                function getSuggestedPosts() {
                    getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if (resp.postsArray.length > 0) {
                                updateSuggestedPosts(resp.postsArray);
                            } else {
                                //do nothing
                            }
                            $rootScope.main.responseStatusHandler(resp);

                        })
                        .error(function (errResp) {
                            $rootScope.main.responseStatusHandler(errResp);
                        });
                }

                getSuggestedPosts();

                function getSuggestedPostsFromServer() {
                    return $http.post('/api/getSuggestedPosts', {})
                }

                function updateSuggestedPosts(suggestedPostsArray) {
                    if (suggestedPostsArray == []) {
                        $scope.suggestedPosts = [];
                    } else {
                        $scope.suggestedPosts = $filter('preparePostsNoChange')(null, suggestedPostsArray);
                    }
                }
            }
        }
    }]);