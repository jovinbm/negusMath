angular.module('adminHomeApp', [
    'ui.bootstrap',
    'angular-loading-bar',
    'cfp.loadingBar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngAnimate',
    'textAngular',
    'ngSanitize',
    'angularUtils.directives.dirDisqus',
    'ngTagsInput'
])
    .run(function ($templateCache, $http) {
        //views
        $http.get('views/admin/partials/views/post_stream.html', {cache: $templateCache});
        $http.get('views/admin/partials/views/full_post.html', {cache: $templateCache});
        $http.get('views/search/search_results.html', {cache: $templateCache});
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
            .state('search', {
                url: '/search/?q',
                templateUrl: 'views/search/search_results.html'
            })
            .state("otherwise", {url: '/home/1'});

        $locationProvider
            .html5Mode(false)
            .hashPrefix('!');
    }]);