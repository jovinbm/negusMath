angular.module('adminHomeApp', [
    'ui.bootstrap',
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
    'ngTagsInput',
    'ui.utils'
])
    .run(function ($templateCache, $http, $rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    })

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .when("/home/stream/", '/home/stream/1')
            .when("/home/post/", '/home')
            .when("/home/editPost/", '/home')
            .when("/home/search/", '/home/')
            .otherwise("/home");

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'views/admin/partials/views/home.html'
            })
            .state('home.stream', {
                url: '/stream/:pageNumber',
                templateUrl: 'views/admin/partials/views/post_stream.html'
            })
            .state('home.post', {
                url: '/post/:postIndex',
                templateUrl: 'views/admin/partials/views/full_post.html'
            })
            .state('home.editPost', {
                url: '/editPost/:postIndex',
                templateUrl: 'views/admin/partials/views/edit_post.html'
            })
            .state('home.search', {
                url: '/search/:queryString/:pageNumber',
                templateUrl: 'views/search/search_results.html'
            })
            .state('users', {
                url: '/users',
                templateUrl: 'views/admin/partials/views/users.html'
            })
            .state("otherwise", {url: '/home'});

        $locationProvider
            .html5Mode(false)
            .hashPrefix('!');
    }]);