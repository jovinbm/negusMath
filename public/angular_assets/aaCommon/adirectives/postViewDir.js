angular.module('app')
    .directive('postContent', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post-components/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postContent = $filter('preparePostContent')($scope.postContent);
            }
        }
    }])
    .directive('postSummary', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post-components/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postSummary = $filter('preparePostSummary')($scope.postSummary);
            }
        }
    }])
    .directive('postTags', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post-components/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);