angular.module('app')
    .directive('trashPostDir', ['$rootScope', 'PostService', 'globals', function ($rootScope, PostService, globals) {
        return {
            template: ' <a class="btn-link btn btn-default btn-sm" href ng-click="trashPost(post.postUniqueCuid)">Delete</a>',
            restrict: 'AE',
            scope: {
                post: '=model'
            },
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
                }
            }
        }
    }]);