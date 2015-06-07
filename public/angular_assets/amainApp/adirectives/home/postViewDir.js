angular.module('mainApp')
    .directive('postContent', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postContent = $filter('preparePostContent')($scope.postContent);
            }
        }
    }])
    .directive('postSummary', ['$filter',function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postSummary = $filter('preparePostContent')($scope.postSummary)
            }
        }
    }])
    .directive('postTags', ['$filter',function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);