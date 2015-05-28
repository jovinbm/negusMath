angular.module('adminHomeApp')
    .directive('usersCount', ['$q', '$log', '$rootScope', function ($q, $log, $rootScope) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);