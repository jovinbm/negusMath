angular.module('indexApp', [
    'ui.bootstrap',
    'angular-loading-bar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngAnimate',
    'ui.utils'
])
    .run(function ($templateCache, $http) {
    });

//configuration of various modules
angular.module('indexApp', ['duScroll'])
    .value('duScrollOffset', 60);