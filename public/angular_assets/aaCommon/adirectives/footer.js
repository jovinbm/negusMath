angular.module('app')
    .directive('mainFooter', [function () {
        return {
            templateUrl: 'views/all/partials/components/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);