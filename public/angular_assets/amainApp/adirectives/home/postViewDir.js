angular.module('mainApp')
    .directive('postContent', [function () {
        return {
            templateUrl: 'views/all/partials/templates/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postSummary', [function () {
        return {
            templateUrl: 'views/all/partials/templates/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postTags', [function () {
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