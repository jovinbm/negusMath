angular.module('mainApp')
    .directive('usersCount', ['$q', '$log', '$rootScope', function ($q, $log, $rootScope) {
        return {
            templateUrl: 'views/all/partials/templates/user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);