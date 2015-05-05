angular.module('clientHomeApp', [
    'ui.bootstrap',
    'angular-loading-bar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngAnimate',
    'textAngular',
    'ngSanitize',
    'angularUtils.directives.dirDisqus'
])
    .run(function ($templateCache, $http) {
        //views
        $http.get('views/client/partials/views/post_stream.html', {cache: $templateCache});
        $http.get('views/client/partials/views/full_post.html', {cache: $templateCache});
    })

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise("/home/1");

        $stateProvider
            .state('home', {
                url: '/home/:pageNumber',
                templateUrl: 'views/admin/partials/views/post_stream.html'
            })
            .state('post', {
                url: '/post/:postIndex',
                templateUrl: 'views/admin/partials/views/full_post.html'
            })
            .state("otherwise", {url: '/home/1'});

        $locationProvider
            .html5Mode(false)
            .hashPrefix('!');
    }]);