angular.module('adminHomeApp')
    .directive('postContent', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_content.html',
            scope: true,
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postContent = $filter('highlightText')($scope.post.postContent);
            }
        }
    }])
    .directive('postSummary', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_summary.html',
            scope: true,
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postSummary = $filter('highlightText')($scope.post.postSummary);
            }
        }
    }])
    .directive('postTags', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_tags.html',
            scope: true,
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postTags = $scope.post.postTags;
                $scope.postTags.forEach(function (tag) {
                    tag.text = $filter('highlightText')(tag.text);
                })
            }
        }
    }]);