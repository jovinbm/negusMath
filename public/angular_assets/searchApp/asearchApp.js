angular.module('searchApp', [
    'ui.bootstrap',
    'angular-loading-bar',
    'cfp.loadingBar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngAnimate'
])
    .run(function ($templateCache, $http) {
        //views
        $http.get('views/client/partials/views/post_stream.html', {cache: $templateCache});
        $http.get('views/client/partials/views/full_post.html', {cache: $templateCache});
        $http.get('views/search/search_results.html', {cache: $templateCache});
    });