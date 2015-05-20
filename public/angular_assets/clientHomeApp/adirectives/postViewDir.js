angular.module('clientHomeApp')
    .directive('postContent', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postSummary', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postTags', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);