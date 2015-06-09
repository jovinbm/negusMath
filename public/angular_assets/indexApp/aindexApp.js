//angular sanitize included in textAngular
angular.module('app')
    .run(['$templateCache', '$http', '$rootScope', '$state', '$stateParams', function ($templateCache, $http, $rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.Utils = {
            keys: Object.keys
        };
    }])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'notificationsConfigProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, notificationsConfigProvider) {
        $locationProvider.html5Mode(true);
        //    $urlRouterProvider
        //        .when("/home/stream/", '/home/stream/1')
        //        .when("/home/post/", '/home')
        //        .when("/home/editPost/", '/home')
        //        .when("/home/search/", '/home/')
        //        .otherwise("/home");
        //
        //    $stateProvider
        //        .state('home', {
        //            url: '/home',
        //        })
        //        .state('home.post', {
        //            url: '/post/:postIndex',
        //            templateUrl: 'views/all/partials/views/home/full_post.html'
        //        })
        //        .state('home.newPost', {
        //            url: '/newPost',
        //            templateUrl: 'views/all/partials/views/home/new_post.html'
        //        })
        //        .state('home.editPost', {
        //            url: '/editPost/:postIndex',
        //            templateUrl: 'views/all/partials/views/home/edit_post.html'
        //        })
        //        .state('home.search', {
        //            url: '/search/:queryString/:pageNumber',
        //            templateUrl: 'views/search/search_results.html'
        //        })
        //        .state('users', {
        //            url: '/users',
        //            templateUrl: 'views/all/partials/views/users/users.html'
        //        })
        //        .state("otherwise", {url: '/home'});

        //$locationProvider
        //    .html5Mode(false)
        //    .hashPrefix('!');

        notificationsConfigProvider.setAutoHide(true);
        notificationsConfigProvider.setHideDelay(10000);
        notificationsConfigProvider.setAcceptHTML(true);
    }])
    .value('duScrollOffset', 60);