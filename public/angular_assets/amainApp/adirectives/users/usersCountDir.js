angular.module('mainApp')
    .directive('usersCount', ['$q', '$log', '$rootScope', 'globals', function ($q, $log, $rootScope, globals) {
        return {
            templateUrl: 'views/all/partials/templates/user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);