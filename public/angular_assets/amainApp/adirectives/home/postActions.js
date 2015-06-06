angular.module('mainApp')
    .directive('postActionsScope', ['$rootScope', 'PostService', 'globals', function ($rootScope, PostService, globals) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.trashPost = function (postUniqueCuid) {
                    if (postUniqueCuid && globals.checkAccountStatus()) {
                        PostService.trashPost(postUniqueCuid)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                PostService.removePostWithUniqueCuid(postUniqueCuid);
                                $rootScope.back();
                            })
                            .error(function (err) {
                                $rootScope.main.responseStatusHandler(err);
                            })
                    }
                };
            }
        }
    }]);