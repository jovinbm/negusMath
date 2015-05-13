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
        //views
        $http.get('views/admin/partials/views/post_stream.html', {cache: $templateCache});
        $http.get('views/admin/partials/views/full_post.html', {cache: $templateCache});
        $http.get('views/search/search_results.html', {cache: $templateCache});
    })

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .when("/home", '/home/1')
            .when("/home/", '/home/1')
            .when("/search", '/home/1')
            .otherwise("/home/1");

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
                url: '/search/:queryString/:pageNumber',
                templateUrl: 'views/search/search_results.html'
            })
            .state("otherwise", {url: '/home/1'});

        $locationProvider
            .html5Mode(false)
            .hashPrefix('!');
    }]);
angular.module('adminHomeApp')
    .directive('universalBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/admin/partials/smalls/universal_banner.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.universalBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('universalBanner', function (event, banner) {
                    $scope.universalBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.universalBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }])
    .directive('newPostBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/admin/partials/smalls/new_post_banner.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.newPostBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('newPostBanner', function (event, banner) {
                    $scope.newPostBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.newPostBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }])
    .directive('toastrDirective', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.showToast = function (toastType, text) {
                    switch (toastType) {
                        case "success":
                            toastr.clear();
                            toastr.success(text);
                            break;
                        case "warning":
                            toastr.clear();
                            toastr.warning(text, 'Warning', {
                                closeButton: true,
                                tapToDismiss: true
                            });
                            break;
                        case "error":
                            toastr.clear();
                            toastr.error(text, 'Error', {
                                closeButton: true,
                                tapToDismiss: true,
                                timeOut: false
                            });
                            break;
                        default:
                            //clears current list of toasts
                            toastr.clear();
                    }
                };

                $rootScope.clearToasts = function () {
                    toastr.clear();
                };
            }
        }
    }])
    .directive('loadingBanner', ['$rootScope', function ($rootScope) {
        var controller = ['$scope', '$rootScope', 'cfpLoadingBar', function ($scope, $rootScope, cfpLoadingBar) {

            $rootScope.isLoading = false;
            $rootScope.isLoadingPercentage = 0;
            $rootScope.changeIsLoadingPercentage = function (num) {
                $rootScope.isLoadingPercentage = num;
            };

            //hides or shows the loading splash screen
            $rootScope.showHideLoadingBanner = function (bool) {
                if (bool) {
                    $('#loading-splash-card').removeClass('hidden');
                    $('.hideMobileLoading').addClass('hidden-xs hidden-sm');
                } else {
                    $('#loading-splash-card').addClass('hidden');
                    $('.hideMobileLoading').removeClass('hidden-xs hidden-sm');
                }
            };

            $rootScope.$on('cfpLoadingBar:loading', function (event, resp) {
                $rootScope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:loaded', function (event, resp) {
                $rootScope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:completed', function (event, resp) {
                $rootScope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.isLoadingTrue = function () {
                $rootScope.isLoading = true;
            };
            $rootScope.isLoadingFalse = function () {
                $rootScope.isLoading = false;
            };

            $rootScope.$on('isLoadingTrue', function () {
                $rootScope.isLoading = true;
            });

            $rootScope.$on('isLoadingFalse', function () {
                $rootScope.isLoading = false;
            });
        }];

        return {
            templateUrl: 'views/admin/partials/smalls/loading_banner.html',
            restrict: 'AE',
            controller: controller
        }
    }]);
angular.module('adminHomeApp')
    .directive('titleDirective', ['globals', function (globals) {
        return {
            template: '<title ng-bind="defaultTitle">' + '</title>',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.defaultTitle = globals.getDocumentTitle();
                $scope.$watch(globals.getDocumentTitle, function () {
                    $scope.defaultTitle = globals.getDocumentTitle();
                });
            }
        }
    }])
    .directive('universalSearchBox', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {
            templateUrl: 'views/admin/partials/smalls/universal_search_box.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.mainSearchModel = {
                    queryString: "",
                    postSearchUniqueCuid: "",
                    requestedPage: 1
                };

                $scope.fillSearchBox = function () {
                    //check latest state
                    if ($rootScope.$state.current.name == 'search') {
                        $scope.mainSearchModel.queryString = $rootScope.$stateParams.queryString ? $rootScope.$stateParams.queryString : "";
                    } else if ($rootScope.stateHistory.length > 0) {
                        if ($rootScope.stateHistory[$rootScope.stateHistory.length - 1].hasOwnProperty('search')) {
                            //checking the previous state
                            $scope.mainSearchModel.queryString = $rootScope.stateHistory[$rootScope.stateHistory.length - 1]['search'].queryString
                        } else {
                            $scope.mainSearchModel.queryString = "";
                        }
                    } else {
                        $scope.mainSearchModel.queryString = "";
                    }
                };

                $scope.fillSearchBox();

                $scope.performMainSearch = function () {
                    if ($scope.mainSearchModel.queryString.length > 0) {
                        if ($location.port()) {
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/#!/search/" + $scope.mainSearchModel.queryString + "/1";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/#!/search/" + $scope.mainSearchModel.queryString + "/1";
                        }
                    }
                };
            }
        }
    }])
    .directive('topNav', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {

            templateUrl: 'views/admin/partials/views/top_nav.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutService.logoutClient()
                        .success(function (resp) {
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }])
    .directive('pagerDirective', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {

            templateUrl: 'views/admin/partials/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.showPaging = false;
                $rootScope.showThePager = function () {
                    $scope.showPaging = true;
                };
                $rootScope.hideThePager = function () {
                    $scope.showPaging = false;
                };
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $rootScope.changePagingTotalCount = function (newTotalCount) {
                    $scope.pagingTotalCount = newTotalCount;
                };

                $scope.currentPage = $rootScope.$stateParams.pageNumber;
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //refresh the currentPage if the user is going to a new state
                    if (fromState.name != toState.name) {
                        $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        $scope.pagingTotalCount = 1
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage});
                    $scope.goToTop();
                };
            }
        }
    }]);
angular.module('adminHomeApp')
    .directive('newPostDirective', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/new_post.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.newPost = false;
                $scope.showNewPost = function () {
                    $scope.newPost = true;
                };
                $rootScope.showNewPost = function () {
                    $scope.showNewPost();
                };
                $scope.hideNewPost = function () {
                    $scope.newPost = false;
                };
                $rootScope.hideNewPost = function () {
                    $scope.hideNewPost();
                };

                $scope.newPostModel = {
                    postHeading: "",
                    postContent: "",
                    postSummary: "",
                    postTags: []
                };

                //broadcast here helps distinguish from the inform checking and the checking on submit, which requires notifications
                //broadcast takes a boolean value
                $scope.validateForm = function (notify) {
                    console.log(notify);
                    var errors = 0;
                    if (!$filter("validatePostHeading")($scope.newPostModel.postHeading, notify)) {
                        errors++;
                    }
                    if (errors == 0) {
                        if (!$filter("validatePostContent")($scope.newPostModel.postContent, notify)) {
                            errors++;
                        }
                    }
                    if (errors == 0) {
                        if (!$filter("validatePostSummary")($scope.newPostModel.postSummary, notify)) {
                            errors++;
                        }
                    }
                    if (errors == 0) {
                        if (!$filter("validatePostTags")($scope.newPostModel.postTags, notify) && errors == 0) {
                            errors++;
                        }
                    }
                    return errors == 0;
                };

                $scope.submitNewPost = function () {
                    if ($scope.validateForm(true)) {
                        var newPost = {
                            postHeading: $scope.newPostModel.postHeading,
                            postContent: $scope.newPostModel.postContent,
                            postSummary: $scope.newPostModel.postSummary,
                            postTags: $scope.newPostModel.postTags
                        };
                        PostService.submitNewPost(newPost).
                            success(function (resp) {
                                $scope.hideNewPost();
                                $rootScope.responseStatusHandler(resp);
                                $scope.newPostModel.postHeading = "";
                                $scope.newPostModel.postContent = "";
                                $scope.newPostModel.postSummary = "";
                                $scope.newPostModel.postTags = [];
                            })
                            .error(function (errResponse) {
                                $rootScope.responseStatusHandler(errResponse);
                            })
                    }
                }
            }
        }
    }])
    .directive('contentMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="model.postContent | postContentMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                model: '='
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostContent")($scope.model.postContent);
                }
            }
        }
    }])
    .directive('summaryMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="model.postSummary | postSummaryMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                model: '='
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostSummary")($scope.model.postSummary);
                }
            }
        }
    }])
    .directive('tagMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="model.postTags | postTagsMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                model: '='
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostTags")($scope.model.postTags);
                }
            }
        }
    }]);
angular.module('adminHomeApp')
    .directive('postContent', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_content.html',
            scope: true,
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postContent = $filter('highlightText')($scope.post.postContent);
            }
        }
    }])
    .directive('postSummary', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_summary.html',
            scope: true,
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postSummary = $filter('highlightText')($scope.post.postSummary);
            }
        }
    }])
    .directive('postTags', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_tags.html',
            scope: true,
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postTags = $scope.post.postTags;
                $scope.postTags.forEach(function (tag) {
                    tag.text = $filter('highlightText')(tag.text);
                })
            }
        }
    }]);
angular.module('adminHomeApp')
    .controller('HotController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'HotService', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, HotService, fN) {

            $scope.hotThisWeek = HotService.getHotThisWeek();

            function getHotThisWeek() {
                HotService.getHotThisWeekFromServer()
                    .success(function (resp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek(resp.hotThisWeek);
                    })
                    .error(function (errResp) {
                        $rootScope.responseStatusHandler(errResp);
                    });
            }

            getHotThisWeek();

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                getHotThisWeek();
            });
        }
    ]);
angular.module('adminHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService', 'PostService', '$document', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService, PostService, $document) {

            $scope.indexPageUrl = globals.allData.indexPageUrl;

            //back navigation functionality
            var history = [];
            $rootScope.stateHistory = [];
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                history.push($location.$$path);
                //push the previous state also
                var temp = {};
                temp[fromState.name] = fromParams;
                $rootScope.stateHistory.push(temp);
            });
            $rootScope.back = function () {
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
            };

            $scope.showHideLoadingBanner = function (bool) {
                if ($rootScope.showHideLoadingBanner) {
                    $rootScope.showHideLoadingBanner(bool);
                }
            };

            $scope.showThePager = function (bool) {
                if ($rootScope.showThePager) {
                    $rootScope.showThePager(bool);
                }
            };

            $scope.changePagingTotalCount = function (newTotalCount) {
                if ($rootScope.changePagingTotalCount) {
                    $rootScope.changePagingTotalCount(newTotalCount);
                }
            };

            $scope.showDisqus = $location.host().search("negusmath") !== -1;

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.clearBanners();
                $rootScope.clearToasts();
            });

            //register error handler error handler
            $rootScope.responseStatusHandler = function (resp) {
                $filter('responseFilter')(resp);
            };

            $rootScope.clearBanners = function () {
                $rootScope.$broadcast('clearBanners');
            };

            //scrolling functions
            var duration = 0; //milliseconds
            var offset = 40; //pixels; adjust for floating menu, context etc
            //Scroll to #some-id with 30 px "padding"
            //Note: Use this in a directive, not with document.getElementById

            //scrolling to top
            $scope.goToTop = function () {
                var someElement = angular.element(document.getElementById('top'));
                $document.scrollToElement(someElement, 80, duration);
            };

            //=====================time functions=======================
            $scope.currentTime = "";

            //set current Date
            $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            var updateCurrentTime = function () {
                $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            };
            $interval(updateCurrentTime, 20000, 0, true);

            //======================end time functions===================


            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        $scope.clientIsRegistered = $scope.userData.isRegistered == 'yes';

                        if ($scope.userData.isRegistered == 'yes') {
                            //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                            socket.emit('joinRoom', {
                                room: resp.userData.uniqueCuid
                            });
                        }

                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            }

            socket.on('joined', function () {
                console.log("JOIN SUCCESS");
            });

            initialRequests();


            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
            });
        }
    ]);
angular.module('adminHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, fN) {

            $scope.showThePager();
            globals.defaultDocumentTitle();

            $scope.posts = PostService.getCurrentPosts();
            $scope.postsCount = PostService.getCurrentPostsCount();

            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.mainSearchResultsPosts = false;
            $scope.showSuggestedPosts = false;

            $scope.showThePostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.mainSearchResultsPosts = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.mainSearchResultsPosts = false;
                $scope.showSuggestedPosts = true;
            };

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                $scope.showHideLoadingBanner(true);
                //empty the suggestedPosts
                $scope.suggestedPosts = [];
                PostService.getSuggestedPostsFromServer()
                    .success(function (resp) {
                        if ((resp.postsArray.length > 0)) {
                            $scope.showSuggestedPostsOnly();
                            $scope.suggestedPosts = resp.postsArray;
                            $scope.suggestedPosts = $filter('makeVideoIframesResponsive')(null, $scope.suggestedPosts);
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToTop();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToTop();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $rootScope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getPagePosts() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostsFromServer($rootScope.$stateParams.pageNumber)
                    .success(function (resp) {
                        //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
                        //used if the user is accessing a page that is beyond the number of posts
                        if (resp.postsArray.length == 0) {

                            //empty the postsArray
                            $scope.posts = [];

                            var responseMimic = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "No more posts to show"
                            };
                            $rootScope.responseStatusHandler(responseMimic);
                            $scope.mainSearchResultsPosts = false;
                            getSuggestedPosts();
                            $scope.goToTop();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
                            $scope.posts = $filter('makeVideoIframesResponsive')(null, $scope.posts);

                            $scope.showThePostsOnly();


                            if (resp.postsCount) {
                                $scope.postsCount = resp.postsCount;
                                $scope.changePagingTotalCount($scope.postsCount);
                            }
                            $scope.showThePager();
                        }
                    })
                    .error(function (errResp) {
                        $rootScope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.posts = [];
                        $scope.mainSearchResultsPosts = false;
                        getSuggestedPosts();
                    });
            }

            getPagePosts();

            //===============socket listeners===============

            $rootScope.$on('newPost', function (event, data) {
                //newPost goes to page 1, so update only if the page is 1
                if ($rootScope.$stateParams.pageNumber == 1) {
                    data.post = $filter('makeVideoIframesResponsive')(data.post, null);
                    $scope.posts.unshift(data.post);
                }
                if (data.postsCount) {
                    $scope.postsCount = data.postsCount;
                    $scope.changePagingTotalCount($scope.postsCount);
                }
            });

            $rootScope.$on('reconnect', function () {
                if ($rootScope.$state.current.name == 'home') {
                    getPagePosts();
                }
            });
        }
    ])

    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams, fN) {
            //hide paging
            $scope.hideThePager();

            $scope.postIndex = $stateParams.postIndex;
            $scope.post = {};
            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.showPost = false;
            $scope.showSuggestedPosts = false;

            $scope.showThePostOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.showPost = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.showPost = false;
                $scope.showSuggestedPosts = true;
            };

            $scope.postIsLoaded = false;

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                $scope.showHideLoadingBanner(true);
                //empty the suggestedPosts
                $scope.suggestedPosts = [];
                PostService.getSuggestedPostsFromServer()
                    .success(function (resp) {
                        if ((resp.postsArray.length > 0)) {
                            $scope.showSuggestedPostsOnly();
                            $scope.suggestedPosts = resp.postsArray;
                            $scope.suggestedPosts = $filter('makeVideoIframesResponsive')(null, $scope.suggestedPosts);
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToTop();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToTop();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $rootScope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getFullPost() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $rootScope.responseStatusHandler(resp);
                        if (fN.calcObjectLength($scope.post) != 0) {
                            $scope.post = $filter('makeVideoIframesResponsive')($scope.post, null);
                            $scope.post = $filter('AddPostUrl')($scope.post, null);
                            globals.changeDocumentTitle($scope.post.postHeading);
                            //check that there is a post first before starting disqus and other attributes
                            $scope.showThePostOnly();

                            //check first that this is a production env --> showDisqus before bootstrapping disqus
                            if ($scope.showDisqus) {
                                $scope.postIsLoaded = true;
                            }

                            $scope.hideThePager();

                        } else {
                            //empty the post
                            $scope.post = {};
                            $scope.showPost = false;
                            getSuggestedPosts();
                            $scope.goToTop();
                        }

                    })
                    .error(function (errResponse) {
                        $rootScope.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.post = {};
                        $scope.showPost = false;
                        getSuggestedPosts();
                    });
            }

            getFullPost();

            //=============editing post====================

            //variable that holds the editing or show state in the full-post view.
            $scope.editingMode = false;

            //make copy of post, useful when the user clicks cancel
            $scope.postBackup = $scope.post;

            $scope.goIntoPostEditingMode = function () {
                $scope.hideThePager();

                //make copy of post, useful when the user clicks cancel
                $scope.postBackup = $scope.post;
                $scope.editingMode = true;
            };

            $scope.goIntoFullPostViewMode = function () {
                $scope.editingMode = false;
                $scope.hideThePager();
            };

            $scope.editPostHeadingLessMin = false;
            $scope.editPostContentIsEmpty = true;
            $scope.editPostSummaryIsEmpty = true;
            $scope.editPostSummaryHasExceededMaximum = false;

            $scope.checkIfEditPostHeadingLessMin = function () {
                if ($scope.post.postHeading) {
                    var postHeadingText = $scope.post.postHeading;
                    if (postHeadingText.length < 10) {
                        $scope.editPostHeadingLessMin = true;
                    }
                    else {
                        $scope.editPostHeadingLessMin = false;
                    }
                    return $scope.editPostHeadingLessMin
                } else {
                    return true;
                }
            };

            $scope.checkIfEditPostContentIsEmpty = function () {
                if ($scope.post.postContent) {
                    var postContentText = $("<div>" + $scope.post.postContent + "</div>").text();
                    if (postContentText.length == 0) {
                        $scope.editPostContentIsEmpty = true;
                    }
                    else {
                        $scope.editPostContentIsEmpty = false;
                    }
                    return $scope.editPostContentIsEmpty
                } else {
                    return true;
                }
            };

            $scope.checkIfEditPostSummaryIsEmpty = function () {
                if ($scope.post.postSummary) {
                    var editPostSummaryText = $("<div>" + $scope.post.postSummary + "</div>").text();
                    if (editPostSummaryText.length == 0) {
                        $scope.editPostSummaryIsEmpty = true;
                    }
                    else {
                        $scope.editPostSummaryIsEmpty = false;
                    }
                    return $scope.editPostSummaryIsEmpty
                } else {
                    return true;
                }
            };

            $scope.checkEditPostSummaryMaxLength = function (maxLength) {
                if ($scope.post.postSummary) {
                    var editPostSummaryText = $("<div>" + $scope.post.postSummary + "</div>").text();
                    if (editPostSummaryText.length > maxLength) {
                        $scope.editPostSummaryHasExceededMaximum = true;
                    } else {
                        $scope.editPostSummaryHasExceededMaximum = false;
                    }
                    return $scope.editPostSummaryHasExceededMaximum
                } else {
                    return true;
                }
            };

            //returns true if tags pass validation
            $scope.checkEditPostTags = function () {
                var errorPostTags = 0;
                var numberOfTags = 0;

                $scope.post.postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (errorPostTags == 0) {
                        if (tag.text.length < 3 && errorPostTags == 0) {
                            errorPostTags++;
                            $rootScope.showToast('warning', 'Minimum allowed length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30 && errorPostTags == 0) {
                            errorPostTags++;
                            $rootScope.showToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5 && errorPostTags == 0) {
                    errorPostTags++;
                    $rootScope.showToast('warning', 'Only a maximum of 5 tags are allowed per post');
                }

                if (errorPostTags == 0) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.submitPostUpdate = function () {
                var errors = 0;

                //validate post heading
                if ($scope.checkIfEditPostHeadingLessMin() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'The minimum required length of the heading is 10 characters');
                }

                //validatePostContent
                if ($scope.checkIfEditPostContentIsEmpty() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'Please add some text to the post first');
                }

                //validate postSummary
                if ($scope.checkIfEditPostSummaryIsEmpty() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'The post summary cannot be empty');
                }

                if ($scope.checkEditPostSummaryMaxLength() && errors == 0) {
                    errors++;
                    $rootScope.showToast('warning', 'The post summary cannot exceed 2000 characters');
                }

                //validate tags
                //note that the edit post tags returns true if validation succeeded
                //it also shows toasts depending on whats missing
                if (!$scope.checkEditPostTags() && errors == 0) {
                    errors++;
                }

                if (errors == 0) {
                    PostService.submitPostUpdate($scope.post)
                        .success(function (resp) {
                            $scope.goIntoFullPostViewMode();
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.responseStatusHandler(errResponse);
                        })
                }
            };

            $scope.cancelPostUpdate = function () {
                $scope.post = $scope.postBackup;
                $scope.goIntoFullPostViewMode();
                $rootScope.showToast('success', 'Update cancelled');
            };

            //end of editing post functions================

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                    data.post = $filter('makeVideoIframesResponsive')(data.post, null);
                    $scope.post = data.post;
                }
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                if (!$scope.editingMode) {
                    if ($rootScope.$state.current.name == 'post') {
                        getFullPost();
                    }
                }
            });
        }
    ]);
angular.module('adminHomeApp')
    .controller('SearchController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, fN) {

            $scope.showThePager();

            $scope.mainSearchModel = {
                queryString: $rootScope.$stateParams.queryString || '',
                postSearchUniqueCuid: "",
                requestedPage: $rootScope.$stateParams.pageNumber || 1
            };

            //change to default document title
            globals.changeDocumentTitle($rootScope.$stateParams.queryString + " - NegusMath Search");

            $scope.mainSearchResultsPosts = PostService.getCurrentPosts();
            $scope.mainSearchResultsCount = 0;

            $scope.changeCurrentPage = function (page) {
                if (page != $rootScope.$stateParams.pageNumber) {
                    //change page here****************************************
                }
            };

            $scope.suggestedPosts = [];

            //variable that determines whether to show posts/suggested posts or not
            $scope.showMainSearchResults = false;
            $scope.showSuggestedPosts = false;

            $scope.showMainSearchResultsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.showMainSearchResults = true;
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.showHideLoadingBanner(false);
                $scope.showMainSearchResults = false;
                $scope.showSuggestedPosts = true;
            };

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                $scope.showHideLoadingBanner(true);
                //empty the suggestedPosts
                $scope.suggestedPosts = [];
                PostService.getSuggestedPostsFromServer()
                    .success(function (resp) {
                        if ((resp.postsArray.length > 0)) {
                            $scope.showSuggestedPostsOnly();
                            $scope.suggestedPosts = resp.postsArray;
                            $scope.suggestedPosts = $scope.suggestedPosts = $filter('makeVideoIframesResponsive')(null, $scope.suggestedPosts);
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToTop();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToTop();
                        $scope.showHideLoadingBanner(false);
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $rootScope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getMainSearchResults() {
                $scope.showHideLoadingBanner(true);

                $scope.mainSearchModel = {
                    queryString: $rootScope.$stateParams.queryString || '',
                    postSearchUniqueCuid: "",
                    requestedPage: $rootScope.$stateParams.pageNumber || 1
                };

                PostService.mainSearch($scope.mainSearchModel)
                    .success(function (resp) {
                        var theResult = resp.results;

                        PostService.updateMainSearchResults(theResult);
                        $scope.mainSearchResultsCount = theResult.totalResults;
                        $scope.changePagingTotalCount($scope.mainSearchResultsCount);
                        $scope.changeCurrentPage(theResult.page);
                        $scope.mainSearchModel.postSearchUniqueCuid = theResult.searchUniqueCuid;

                        //the response is the resultValue
                        if (theResult.totalResults > 0) {
                            $scope.mainSearchResultsPosts = theResult.postsArray;
                            $scope.mainSearchResultsPosts = $filter('makeVideoIframesResponsive')(null, $scope.mainSearchResultsPosts);
                            $scope.showMainSearchResultsOnly();

                            var responseMimic1 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned " + $scope.mainSearchResultsCount + " results"
                            };
                            $rootScope.responseStatusHandler(responseMimic1);
                            $scope.showThePager();
                        } else {
                            //empty the postsArray
                            $scope.mainSearchResultsPosts = [];
                            var responseMimic2 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned 0 results"
                            };
                            $rootScope.responseStatusHandler(responseMimic2);
                            $scope.showMainSearchResults = false;
                            getSuggestedPosts();
                            $scope.goToTop();
                        }
                    })
                    .error(function (errResp) {
                        $rootScope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.mainSearchResultsPosts = [];
                        $scope.showMainSearchResults = false;
                        getSuggestedPosts();
                    });
            }

            getMainSearchResults();

            //this functions evaluates to true if object is not empty, useful for ng-show
            //this function also creates a banner to notify user that there are no posts by mimicing a response and calling the response handler
            $scope.checkIfPostsSearchResultsIsEmpty = function () {
                return $scope.mainSearchResultsPosts.length == 0
            };

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                if ($rootScope.$state.current.name == 'search') {
                    getMainSearchResults();
                }
            });
        }
    ]);
angular.module('adminHomeApp')
    .filter("timeago", function () {
        //time: the time
        //local: compared to what time? default: now
        //raw: whether you want in a format of "5 minutes ago", or "5 minutes"
        return function (time, local, raw) {
            if (!time) return "never";

            if (!local) {
                (local = Date.now())
            }

            if (angular.isDate(time)) {
                time = time.getTime();
            } else if (typeof time === "string") {
                time = new Date(time).getTime();
            }

            if (angular.isDate(local)) {
                local = local.getTime();
            } else if (typeof local === "string") {
                local = new Date(local).getTime();
            }

            if (typeof time !== 'number' || typeof local !== 'number') {
                return;
            }

            var
                offset = Math.abs((local - time) / 1000),
                span = [],
                MINUTE = 60,
                HOUR = 3600,
                DAY = 86400,
                WEEK = 604800,
                MONTH = 2629744,
                YEAR = 31556926,
                DECADE = 315569260;

            if (offset <= MINUTE)              span = ['', raw ? 'now' : 'less than a minute'];
            else if (offset < (MINUTE * 60))   span = [Math.round(Math.abs(offset / MINUTE)), 'min'];
            else if (offset < (HOUR * 24))     span = [Math.round(Math.abs(offset / HOUR)), 'hr'];
            else if (offset < (DAY * 7))       span = [Math.round(Math.abs(offset / DAY)), 'day'];
            else if (offset < (WEEK * 52))     span = [Math.round(Math.abs(offset / WEEK)), 'week'];
            else if (offset < (YEAR * 10))     span = [Math.round(Math.abs(offset / YEAR)), 'year'];
            else if (offset < (DECADE * 100))  span = [Math.round(Math.abs(offset / DECADE)), 'decade'];
            else                               span = ['', 'a long time'];

            span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
            span = span.join(' ');

            if (raw === true) {
                return span;
            }
            return (time <= local) ? span + ' ago' : 'in ' + span;
        }
    })
    .filter("AddTimeAgo", ['$filter', function ($filter) {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (createdAt) {
            return $filter('timeago')(createdAt);
        }
    }])
    .filter("AddPostDate", ['$filter', function () {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (createdAt) {
            return moment(createdAt).format("ddd, MMM D, H:mm");
        }
    }])
    .filter("AddPostUrl", ['$filter', function () {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (post, posts) {
            function addUrl(post) {
                if (post.postIndex) {
                    post.postUrl = 'http://www.negusmath.com/#!/post/' + post.postIndex;
                }
                return post;
            }

            if (post) {
                return addUrl(post);
            } else if (posts) {
                posts.forEach(function (post) {
                    post = addUrl(post);
                });
                return posts;
            }
        }
    }])
    .filter("makeVideoIframesResponsive", ['$filter', function () {
        //making embedded videos responsive
        return function (post, posts) {
            var theElement;
            var imgElement;
            var imgWrappedInDiv;

            function makeResp(post) {
                if (post.postSummary) {
                    //convert the element to string
                    theElement = $("<div>" + post.postSummary + "</div>");

                    //find the video iframe elements
                    imgElement = $('img.ta-insert-video', theElement);

                    //only perform operation if there are iframes available
                    if (imgElement.length > 0) {

                        //add class and wrap in div
                        imgWrappedInDiv = imgElement
                            .addClass('embed-responsive-item')
                            .wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

                        //replace in original
                        theElement.find('img').replaceWith(imgWrappedInDiv);
                    }
                    post.postSummary = theElement.html();

                }
                if (post.postContent) {
                    //convert the element to string
                    theElement = $("<div>" + post.postContent + "</div>");

                    //find the video iframe elements
                    imgElement = $('img.ta-insert-video', theElement);

                    //only perform operation if there are iframes available
                    if (imgElement.length > 0) {

                        //add class and wrap in div
                        imgWrappedInDiv = imgElement
                            .addClass('embed-responsive-item')
                            .wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

                        //replace in original
                        theElement.find('img').replaceWith(imgWrappedInDiv);
                    }
                    post.postContent = theElement.html();
                }
                return post;
            }

            if (post) {
                return makeResp(post)
            } else if (posts) {
                posts.forEach(function (post) {
                    post = makeResp(post);
                });
                return posts;
            }
        }
    }])
    .filter("highlightText", ['$filter', '$rootScope', function ($filter, $rootScope) {
        //making embedded videos responsive
        return function (theElementString) {

            //text is highlighted only if the present or previous state was search
            //this fn checks if the present or previous state was search, and returns an object with status false if not
            //if true, the returned object carries the queryString with it
            function checkSearchState() {
                //check latest state
                if ($rootScope.$state.current.name == 'search') {
                    return {
                        status: true,
                        queryString: $rootScope.$stateParams.queryString || ""
                    }
                } else if ($rootScope.stateHistory.length > 0) {
                    if ($rootScope.stateHistory[$rootScope.stateHistory.length - 1].hasOwnProperty('search')) {
                        //checking the previous state
                        return {
                            status: true,
                            queryString: $rootScope.stateHistory[$rootScope.stateHistory.length - 1]['search'].queryString
                        }
                    } else {
                        return {
                            status: false
                        }
                    }
                } else {
                    return {
                        status: false
                    }
                }
            }

            function highLightThisText(textToHighlight) {
                var finalString = textToHighlight;
                var highlightDetails = checkSearchState();
                if (highlightDetails.status === true) {
                    //highlight
                    var theElement = $("<div>" + textToHighlight + "</div>");
                    $(theElement).highlight(highlightDetails.queryString);
                    finalString = theElement.html();
                } else {
                    //remove highlight
                    var theElement2 = $("<div>" + textToHighlight + "</div>");
                    $(theElement2).removeHighlight();
                    finalString = theElement2.html();
                }
                return finalString;
            }

            return highLightThisText(theElementString);

        }
    }])
    .filter("responseFilter", ['$q', '$filter', '$log', '$interval', '$window', '$location', '$rootScope', 'globals', function ($q, $filter, $log, $interval, $window, $location, $rootScope, globals) {
        //making embedded videos responsive
        return function (resp) {

            function makeBanner(show, bannerClass, msg) {
                return {
                    show: show ? true : false,
                    bannerClass: bannerClass,
                    msg: msg
                }
            }

            if (resp) {
                if (resp.redirect) {
                    if (resp.redirect) {
                        $window.location.href = resp.redirectPage;
                    }
                }
                if (resp.notify) {
                    if (resp.type && resp.msg) {
                        $rootScope.showToast(resp.type, resp.msg);
                    }
                }
                if (resp.banner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('universalBanner', makeBanner(true, resp.bannerClass, resp.msg));
                    }
                }
                if (resp.newPostBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('newPostBanner', makeBanner(true, resp.bannerClass, resp.msg));
                    }
                }
                if (resp.registrationBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('registrationBanner', makeBanner(true, resp.bannerClass, resp.msg));
                    }
                }
                if (resp.reason) {
                    $log.warn(resp.reason);
                }
            } else {
                //do nothing
            }

            return true;
        }
    }]);



angular.module('adminHomeApp')
    .filter("validatePostHeading", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            if (postHeading.length == 0) {
                errors++;
                broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
            }
            if (errors == 0) {
                if (postHeading.length < 10) {
                    broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
                    errors++;
                }
            }
            return errors == 0;
        }
    }])
    .filter("validatePostContent", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postContent, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var postContentText = $("<div>" + postContent + "</div>").text();
            if (postContentText.length == 0) {
                broadcastShowToast('warning', 'Please add some text to the post first')
            }
            return postContentText.length > 0;
        }
    }])
    .filter("postContentMessages", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postContent) {
            var postContentText = $("<div>" + postContent + "</div>").text();
            if (postContentText.length == 0) {
                return "This is a required field. Please add some text"
            } else {
                return "";
            }
        }
    }])
    .filter("validatePostSummary", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postSummary, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var errors = 0;
            var postSummaryText = $("<div>" + postSummary + "</div>").text();

            if (postSummaryText.length == 0) {
                errors++;
                broadcastShowToast('warning', 'The post summary cannot be empty');
            }
            if (errors == 0) {
                if (postSummaryText.length > 2000) {
                    errors++;
                    broadcastShowToast('warning', 'The post summary cannot exceed 2000 characters');
                }
            }
            return errors == 0;
        }
    }])
    .filter("postSummaryMessages", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postSummary) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            var postSummaryText = $("<div>" + postSummary + "</div>").text();

            if (postSummaryText.length == 0) {
                addMessage('The post summary cannot be empty');
            }
            if (postSummaryText.length > 2000) {
                addMessage('The post summary cannot exceed 2000 characters');
            }
            return messages;

        }
    }])
    .filter("validatePostTags", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postTags, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var errors = 0;
            var numberOfTags = 0;

            postTags.forEach(function (tag) {
                numberOfTags++;
                if (tag && tag.text) {
                    if (errors == 0) {
                        if (tag.text.length < 3) {
                            errors++;
                            broadcastShowToast('warning', 'Minimum required length for each tag is 3 characters');
                        }
                    }

                    if (errors == 0) {
                        if (tag.text.length > 30) {
                            errors++;
                            broadcastShowToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                }
            });

            if (errors == 0) {
                if (numberOfTags > 5) {
                    errors++;
                    broadcastShowToast('warning', 'Only a maximum of 5 tags are allowed per post');
                }
            }

            return errors == 0;
        }
    }])
    .filter("postTagsMessages", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postTags) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            var numberOfTags = 0;

            postTags.forEach(function (tag) {
                numberOfTags++;
                if (tag && tag.text) {
                    if (tag.text.length < 3) {
                        addMessage('Minimum required length for each tag is 3 characters');
                    }

                    if (tag.text.length > 30) {
                        addMessage('Maximum allowed length for each tag is 30 characters');
                    }
                }
            });

            if (numberOfTags > 5) {
                addMessage('Only a maximum of 5 tags are allowed per post');
            }

            return messages;
        }
    }]);
angular.module('adminHomeApp')

    .factory('fN', ['$q', '$location', '$window', '$rootScope', 'socketService',
        function ($q, $location, $window, $rootScope, socketService) {
            return {
                calcObjectLength: function (obj) {
                    var len = 0;
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            len++;
                        }
                    }
                    return len
                }
            };
        }]);
angular.module('adminHomeApp')

    .factory('globals', ['$q', '$location', '$window', '$rootScope', 'socketService',
        function ($q, $location, $window, $rootScope, socketService) {
            var userData = {};
            var allData = {
                documentTitle: "Negus Math - College Level Advanced Mathematics for Kenya Students",
                indexPageUrl: $location.port() ? "http://" + $location.host() + ":" + $location.port() + "/index" : $scope.indexPageUrl = "http://" + $location.host() + "/index"
            };

            var universalBanner = {
                show: false,
                bannerClass: "",
                msg: ""
            };

            var registrationBanner = {
                show: false,
                bannerClass: "",
                msg: ""
            };

            var newPostBanner = {
                show: false,
                bannerClass: "",
                msg: ""
            };

            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                },

                allData: allData,

                getDocumentTitle: function () {
                    return allData.documentTitle
                },

                defaultDocumentTitle: function () {
                    allData.documentTitle = "Negus Math - College Level Advanced Mathematics for Kenya Students";
                },

                changeDocumentTitle: function (newDocumentTitle) {
                    if (newDocumentTitle) {
                        allData.documentTitle = newDocumentTitle;
                    }
                    return allData.documentTitle
                }
            };
        }]);
angular.module('adminHomeApp')
    .factory('HotService', ['$log', '$http', '$window', '$rootScope', 'socket', 'socketService', 'globals',
        function ($log, $http, $window, $rootScope, socket, socketService, globals) {

            var hotThisWeek = [];

            socket.on('hotThisWeekPosts', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('hotThisWeekPosts', data);
            });

            return {

                getHotThisWeek: function () {
                    return hotThisWeek;
                },

                getHotThisWeekFromServer: function () {
                    return $http.post('/api/getHotThisWeek', {})
                },

                updateHotThisWeek: function (hotThisWeekArray) {
                    hotThisWeek = hotThisWeekArray;
                    return hotThisWeekArray;
                }
            };
        }]);
angular.module('adminHomeApp')
    .factory('mainService', ['$log', '$window', '$rootScope', 'socket', 'socketService', 'globals',
        function ($log, $window, $rootScope, socket, socketService, globals) {

            socket.on('reconnect', function () {
                $log.info("'reconnect sequence' triggered");
                $rootScope.$broadcast('reconnect');
            });

            return {
                done: function () {
                    return 1;
                }
            };
        }]);
angular.module('adminHomeApp')
    .factory('PostService', ['$log', '$http', '$window', '$rootScope', 'socket', 'socketService', 'globals',
        function ($log, $http, $window, $rootScope, socket, socketService, globals, $stateParams) {

            var posts = [];
            var postsCount = 0;

            var mainSearchResultsPosts = [];

            socket.on('newPost', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('newPost', data);
            });

            socket.on('postUpdate', function (data) {
                //data here has the keys post, postCount
                $rootScope.$broadcast('postUpdate', data);
            });

            return {

                getCurrentPosts: function () {
                    return posts;
                },

                getCurrentPostsCount: function () {
                    return postsCount;
                },

                getPostsFromServer: function (pageNumber) {
                    return $http.post('/api/getPosts', {
                        page: pageNumber
                    })
                },

                getSuggestedPostsFromServer: function () {
                    return $http.post('/api/getSuggestedPosts', {})
                },

                updatePosts: function (postsArray) {
                    posts = postsArray;
                    return postsArray;
                },

                getPostFromServer: function (postIndex) {
                    return $http.post('/api/getPost', {
                        postIndex: postIndex
                    });
                },

                submitNewPost: function (newPost) {
                    return $http.post('/api/newPost', {
                        newPost: newPost
                    });
                },

                submitPostUpdate: function (post) {
                    return $http.post('/api/updatePost', {
                        postUpdate: post
                    });
                },

                getCurrentMainSearchResults: function () {
                    return mainSearchResultsPosts;
                },

                updateMainSearchResults: function (resultValue) {
                    mainSearchResultsPosts = resultValue;
                    return mainSearchResultsPosts;
                },

                mainSearch: function (searchObject) {
                    return $http.post('/api/mainSearch', searchObject);
                }
            };
        }]);
angular.module('adminHomeApp')

    .factory('socket', ['$log', '$location', '$rootScope',
        function ($log, $location, $rootScope) {
            var url;
            if ($location.port()) {
                url = $location.host() + ":" + $location.port();
            } else {
                url = $location.host();
            }
            var socket = io.connect(url);
            //return socket;
            return {
                on: function (eventName, callback) {
                    socket.on(eventName, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                },

                emit: function (eventName, data, callback) {
                    socket.emit(eventName, data, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    });
                },

                removeAllListeners: function (eventName, callback) {
                    socket.removeAllListeners(eventName, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                }
            };
        }])


    .factory('socketService', ['$log', '$http', '$rootScope',
        function ($log, $http, $rootScope) {

            return {

                getUserData: function () {
                    return $http.get('/api/getUserData');
                },

                sendContactUs: function (contactUsModel) {
                    return $http.post('/contactUs', contactUsModel);
                }
            }
        }
    ])

    .factory('logoutService', ['$http',
        function ($http) {
            return {

                logoutClient: function () {
                    return $http.post('/api/logoutClient');
                }
            }
        }]);