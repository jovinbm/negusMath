angular.module('mainApp', [
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
    'ui.utils',
    'ngFileUpload'
])
    .run(function ($templateCache, $http, $rootScope, $state, $stateParams) {

        //views
        $http.get('views/all/partials/views/home/home.html', {cache: $templateCache});
        $http.get('views/all/partials/views/home/post_stream.html', {cache: $templateCache});
        $http.get('views/all/partials/views/home/full_post.html', {cache: $templateCache});

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.Utils = {
            keys: Object.keys
        }
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
                templateUrl: 'views/all/partials/views/home/home.html'
            })
            .state('home.stream', {
                url: '/stream/:pageNumber',
                templateUrl: 'views/all/partials/views/home/post_stream.html'
            })
            .state('home.post', {
                url: '/post/:postIndex',
                templateUrl: 'views/all/partials/views/home/full_post.html'
            })
            .state('home.newPost', {
                url: '/newPost',
                templateUrl: 'views/all/partials/views/home/new_post.html'
            })
            .state('home.editPost', {
                url: '/editPost/:postIndex',
                templateUrl: 'views/all/partials/views/home/edit_post.html'
            })
            .state('home.search', {
                url: '/search/:queryString/:pageNumber',
                templateUrl: 'views/search/search_results.html'
            })
            .state('users', {
                url: '/users',
                templateUrl: 'views/all/partials/views/users/users.html'
            })
            .state("otherwise", {url: '/home'});

        $locationProvider
            .html5Mode(false)
            .hashPrefix('!');
    }]);