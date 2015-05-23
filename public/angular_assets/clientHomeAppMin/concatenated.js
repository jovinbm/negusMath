angular.module('clientHomeApp', [
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
                templateUrl: 'views/client/partials/views/home.html'
            })
            .state('home.stream', {
                url: '/stream/:pageNumber',
                templateUrl: 'views/client/partials/views/post_stream.html'
            })
            .state('home.post', {
                url: '/post/:postIndex',
                templateUrl: 'views/client/partials/views/full_post.html'
            })
            .state('home.search', {
                url: '/search/:queryString/:pageNumber',
                templateUrl: 'views/search/search_results.html'
            })
            .state("otherwise", {url: '/home'});

        $locationProvider
            .html5Mode(false)
            .hashPrefix('!');
    }]);
angular.module('clientHomeApp')
    .directive('accountStatusBanner', ['$rootScope', 'socketService', 'globals', '$location', '$window', function ($rootScope, socketService, globals, $location, $window) {
        return {
            scope: {},
            templateUrl: 'views/general/smalls/account_status.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.accountStatusBanner = {
                    show: false,
                    bannerClass: "",
                    msg: "",
                    showResendEmail: false
                };

                $scope.resendConfirmationEmail = function () {
                    socketService.resendConfirmationEmail()
                        .success(function (resp) {
                            $rootScope.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.responseStatusHandler(err);
                        })
                };


                //initial requests
                function getAccountDetails() {
                    socketService.getUserData()
                        .success(function (resp) {
                            if (resp.userData.isRegistered == true) {
                                $scope.accountStatusBanner = determineAccountStatus(resp.userData);
                                checkAccountStatus(resp.userData);
                            }
                        })
                        .error(function () {
                            $scope.accountStatusBanner = {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "An error has occurred. Please reload page"
                            };
                        });
                }

                getAccountDetails();

                $scope.checkAccount = function (userData) {
                    if (userData) {
                        if (userData.isRegistered && userData.emailIsConfirmed && userData.isApproved && userData.isBanned.status) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                };

                function determineAccountStatus(userData) {
                    console.log(JSON.stringify(userData.emailIsConfirmed));
                    if (userData.isRegistered) {
                        if (!userData.emailIsConfirmed) {
                            return {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "Please confirm your account by clicking the confirmation link we sent on your email. Please also check your spam folder",
                                showResendEmail: true
                            };
                        } else if (userData.isApproved === false) {
                            return {
                                show: true,
                                bannerClass: "alert alert-warning",
                                msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved.",
                                showResendEmail: false
                            };
                        } else if (userData.isBanned) {
                            if (userData.isBanned.status === true) {
                                //checking banned status
                                return {
                                    show: true,
                                    bannerClass: "alert alert-warning",
                                    msg: "Your have been banned from this service. Please contact the administrators for more information",
                                    showResendEmail: false
                                };
                            } else {
                                return {
                                    show: false,
                                    bannerClass: "",
                                    msg: "",
                                    showResendEmail: false
                                };
                            }
                        } else {
                            return {
                                show: false,
                                bannerClass: "",
                                msg: "",
                                showResendEmail: false
                            };
                        }
                    } else {
                        return {
                            show: false,
                            bannerClass: "",
                            msg: "",
                            showResendEmail: false
                        };
                    }
                }

                function checkAccountStatus(userData) {
                    //if account status is not okay, redirect user to index
                    if (!($scope.checkAccount(userData))) {
                        if ($location.port()) {
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/index";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/index";
                        }
                    }
                }

                $rootScope.$on('userDataChanges', function () {
                });

                $rootScope.$on('reconnect', function () {
                    getAccountDetails();
                });
            }
        }
    }])
    .directive('universalBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/client/partials/smalls/universal_banner.html',
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
            templateUrl: 'views/client/partials/smalls/new_post_banner.html',
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

            $rootScope.isLoading = true;
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
            templateUrl: 'views/client/partials/smalls/loading_banner.html',
            restrict: 'AE',
            controller: controller
        }
    }]);
angular.module('clientHomeApp')
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
            templateUrl: 'views/client/partials/smalls/universal_search_box.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.mainSearchModel = {
                    queryString: "",
                    postSearchUniqueCuid: "",
                    requestedPage: 1
                };

                $scope.fillSearchBox = function () {
                    //check latest state
                    if ($rootScope.$state.current.name == 'home.search') {
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
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + "/#!/home/search/" + $scope.mainSearchModel.queryString + "/1";
                        } else {
                            $window.location.href = "http://" + $location.host() + "/#!/home/search/" + $scope.mainSearchModel.queryString + "/1";
                        }
                    }
                };
            }
        }
    }])
    .directive('topNav', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {

            templateUrl: 'views/client/partials/views/top_nav.html',
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
    .directive('postStream', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', function ($q, $filter, $log, $interval, $window, $location, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/post_feed.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.showThePager();
                globals.defaultDocumentTitle();

                $scope.posts = PostService.getCurrentPosts();
                $scope.postsCount = PostService.getCurrentPostsCount();
                $scope.suggestedPosts = PostService.getSuggestedPosts();

                //variable that determines whether to show posts/suggested posts or not
                $scope.mainSearchResultsPosts = false;

                $scope.showThePostsOnly = function () {
                    $scope.hideLoadingBanner();
                    $scope.mainSearchResultsPosts = true;
                    $scope.hideSuggested();
                };

                $scope.showSuggestedPostsOnly = function () {
                    $scope.hideLoadingBanner();
                    $scope.mainSearchResultsPosts = false;
                    $scope.showSuggested();
                };

                function getPagePosts() {
                    $scope.showLoadingBanner();
                    PostService.getPostsFromServer($rootScope.$stateParams.pageNumber || 1)
                        .success(function (resp) {
                            //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
                            //used if the user is accessing a page that is beyond the number of posts
                            if (resp.postsArray.length == 0) {

                                //empty the postsArray
                                $scope.posts = PostService.updatePosts([]);

                                var responseMimic = {
                                    banner: true,
                                    bannerClass: 'alert alert-dismissible alert-success',
                                    msg: "No more posts to show"
                                };
                                $rootScope.responseStatusHandler(responseMimic);
                                $scope.mainSearchResultsPosts = false;
                                $scope.showSuggestedPostsOnly();
                                $scope.goToTop();
                            } else {
                                $scope.posts = PostService.updatePosts(resp.postsArray);
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
                            $scope.posts = PostService.updatePosts([]);
                            $scope.mainSearchResultsPosts = false;
                            $scope.showSuggestedPostsOnly();
                        });
                }

                getPagePosts();

                //===============socket listeners===============

                $rootScope.$on('newPost', function (event, data) {
                    //newPost goes to page 1, so update only if the page is 1
                    if ($rootScope.$stateParams.pageNumber == 1) {
                        $scope.posts = PostService.addNewToPosts(data.post);
                    }
                    if (data.postsCount) {
                        $scope.postsCount = data.postsCount;
                        $scope.changePagingTotalCount($scope.postsCount);
                    }
                });

                $rootScope.$on('reconnect', function () {
                    if ($rootScope.$state.current.name == 'home' || $rootScope.$state.current.name == 'home.stream') {
                        getPagePosts();
                    }
                });
            }
        }
    }])
    .directive('suggestedPosts', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.suggestedPosts = PostService.getSuggestedPosts();

                $scope.showSuggestedPosts = false;
                $rootScope.showHideSuggestedPosts = function (bool) {
                    if (bool) {
                        $scope.showSuggestedPosts = true;
                        //get new suggested posts
                        getSuggestedPosts();
                    } else {
                        $scope.showSuggestedPosts = false;
                    }
                };

                function getSuggestedPosts() {
                    $scope.showLoadingBanner();
                    PostService.getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if ((resp.postsArray.length > 0)) {
                                $scope.suggestedPosts = PostService.updateSuggestedPosts(resp.postsArray);
                                $scope.hideLoadingBanner();
                            } else {
                                //empty the suggestedPosts
                                $scope.suggestedPosts = [];
                                $scope.showSuggestedPosts = false;
                                $scope.goToTop();
                                $scope.hideLoadingBanner();
                            }

                        })
                        .error(function (errResp) {
                            $scope.goToTop();
                            //empty the suggestedPosts
                            $scope.suggestedPosts = PostService.updateSuggestedPosts([]);
                            $scope.showSuggestedPosts = false;
                            $rootScope.responseStatusHandler(errResp);
                            $scope.hideLoadingBanner();
                        });

                    //whatever happens, hide the pager
                    $scope.hideThePager();
                }

                getSuggestedPosts();
            }
        }
    }])
    .directive('pagerDirective', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {

            templateUrl: 'views/client/partials/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.showPaging = false;
                $rootScope.showThePager = function (bool) {
                    if (bool) {
                        $scope.showPaging = true;
                    } else {
                        $scope.showPaging = true;
                    }
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
                        if($rootScope.$state.current.name != 'home') {
                            $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        }
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    console.log($scope.currentPage);
                    if ($rootScope.$state.current.name == 'home') {
                        $rootScope.$state.go('home.stream', {pageNumber: $scope.currentPage});
                    } else {
                        $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage})
                    }
                    $scope.goToTop();
                };
            }
        }
    }])
    .directive('contactUs', ['globals', function (globals) {
        return {
            templateUrl: 'views/client/partials/smalls/contact_us.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('mainFooter', ['globals', function (globals) {
        return {
            templateUrl: 'views/client/partials/smalls/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('clientHomeApp')
    .directive('postContent', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postSummary', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postTags', ['$filter', '$rootScope', 'globals', 'PostService', function ($filter, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/client/partials/smalls/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('clientHomeApp')
    .controller('HotController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'HotService', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, HotService, fN) {

            $scope.hotThisWeek = HotService.getHotThisWeek();

            function getHotThisWeek() {
                HotService.getHotThisWeekFromServer()
                    .success(function (resp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek(resp.hotThisWeek);
                    })
                    .error(function (errResp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek([]);
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
angular.module('clientHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'logoutService', '$document', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, logoutService, $document, fN) {

            //index page url
            $scope.indexPageUrl = globals.allData.indexPageUrl;

            //disqus
            $scope.showDisqus = $location.host().search("negusmath") !== -1;

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

            //this important function broadcasts the availability of the users data to directives that require
            //it e.g. the account status directive
            $scope.broadcastUserData = function () {
                $rootScope.$broadcast('userDataChanges');
            };

            $scope.clientIsRegistered = false;

            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        $scope.broadcastUserData();
                        $scope.clientIsRegistered = $scope.userData.isRegistered;

                        if ($scope.userData.isRegistered) {
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

            initialRequests();

            //$scope functions to be used in other controllers and directives
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

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.clearBanners();
                $rootScope.clearToasts();

                //variable to keep track of when the user is editing the post
                $rootScope.isEditingPost = false;
            });

            //register error handler error handler
            $rootScope.responseStatusHandler = function (resp) {
                $filter('responseFilter')(resp);
            };

            $rootScope.clearBanners = function () {
                $rootScope.$broadcast('clearBanners');
            };

            //loading banner
            $scope.showLoadingBanner = function () {
                if ($rootScope.showHideLoadingBanner) {
                    $rootScope.showHideLoadingBanner(true);
                }
            };

            $scope.hideLoadingBanner = function () {
                if ($rootScope.showHideLoadingBanner) {
                    $rootScope.showHideLoadingBanner(false);
                }
            };

            //pager
            $scope.showThePager = function () {
                if ($rootScope.showThePager) {
                    $rootScope.showThePager();
                }
            };

            $scope.hideThePager = function () {
                if ($rootScope.hideThePager) {
                    $rootScope.hideThePager();
                }
            };

            //suggestedPosts
            $scope.showSuggested = function () {
                if ($rootScope.showHideSuggestedPosts) {
                    $rootScope.showHideSuggestedPosts(true);
                }
            };

            $scope.hideSuggested = function () {
                if ($rootScope.showHideSuggestedPosts) {
                    $rootScope.showHideSuggestedPosts(false);
                }
            };

            //total posts count
            $scope.changePagingTotalCount = function (newTotalCount) {
                if ($rootScope.changePagingTotalCount) {
                    $rootScope.changePagingTotalCount(newTotalCount);
                }
            };

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                initialRequests();
            });
        }
    ]);
angular.module('clientHomeApp')
    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams', 'fN',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams, fN) {
            //hide paging
            $scope.hideThePager();
            $scope.post = PostService.getCurrentPost();

            //variable that determines whether to show posts/suggested posts or not
            $scope.showEditPost = false;

            $scope.showThePostOnly = function () {
                $scope.hideLoadingBanner();
                $scope.showEditPost = true;
                $scope.hideSuggested();
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.hideLoadingBanner();
                $scope.showEditPost = false;
                $scope.showSuggested();
            };

            $scope.postIsLoaded = false;

            function getFullPost() {
                $scope.showLoadingBanner();
                PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $rootScope.responseStatusHandler(resp);
                        if (fN.calcObjectLength(resp.thePost) != 0) {
                            $scope.post = PostService.updatePost(resp.thePost);
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
                            $scope.post = PostService.updatePost({});
                            $scope.showEditPost = false;
                            $scope.showSuggestedPostsOnly();
                            $scope.goToTop();
                        }

                    })
                    .error(function (errResponse) {
                        $rootScope.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.post = PostService.updatePost({});
                        $scope.showEditPost = false;
                        $scope.showSuggestedPostsOnly();
                    });
            }

            getFullPost();

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                    $scope.post = PostService.updatePost(data.post);
                }
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                if (!$rootScope.isEditingPost) {
                    if ($rootScope.$state.current.name == 'home.post') {
                        getFullPost();
                    }
                }
            });
        }
    ]);
angular.module('clientHomeApp')
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

            $scope.mainSearchResultsPosts = PostService.getCurrentMainSearchResults();
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
                $scope.hideLoadingBanner();
                $scope.showMainSearchResults = true;
                $scope.hideSuggested();
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.hideLoadingBanner();
                $scope.showMainSearchResults = false;
                $scope.showSuggested();
            };

            function getMainSearchResults() {
                $scope.showLoadingBanner();

                $scope.mainSearchModel = {
                    queryString: $rootScope.$stateParams.queryString || '',
                    postSearchUniqueCuid: "",
                    requestedPage: $rootScope.$stateParams.pageNumber || 1
                };

                PostService.mainSearch($scope.mainSearchModel)
                    .success(function (resp) {
                        //the response is the resultValue
                        if (resp.results.totalResults > 0) {
                            var theResult = resp.results;
                            $scope.mainSearchResultsPosts = PostService.updateMainSearchResults(theResult.postsArray);
                            $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(theResult.totalResults);
                            $scope.changePagingTotalCount($scope.mainSearchResultsCount);
                            $scope.changeCurrentPage(theResult.page);
                            $scope.mainSearchModel.postSearchUniqueCuid = theResult.searchUniqueCuid;
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
                            $scope.mainSearchResultsPosts = PostService.updateMainSearchResults([]);
                            $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(0);
                            var responseMimic2 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned 0 results"
                            };
                            $rootScope.responseStatusHandler(responseMimic2);
                            $scope.showMainSearchResults = false;
                            $scope.showSuggestedPostsOnly();
                            $scope.goToTop();
                        }
                    })
                    .error(function (errResp) {
                        $rootScope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.mainSearchResultsPosts = PostService.updateMainSearchResults([]);
                        $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(0);
                        $scope.showMainSearchResults = false;
                        $scope.showSuggestedPostsOnly();
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
                if ($rootScope.$state.current.name == 'home.search') {
                    getMainSearchResults();
                }
            });
        }
    ]);
angular.module('clientHomeApp')
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
    .filter("getTimeAgo", ['$filter', function ($filter) {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (createdAt) {
            return $filter('timeago')(createdAt);
        }
    }])
    .filter("getPostDate", ['$filter', function () {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (createdAt) {
            return moment(createdAt).format("ddd, MMM D, H:mm");
        }
    }])
    .filter("getPostAbsoluteUrl", ['$filter', function () {
        return function (postIndex) {
            return 'http://www.negusmath.com/#!/home/post/' + postIndex;
        }
    }])
    .filter("getPostPath", ['$filter', function () {
        return function (postIndex) {
            return '/#!/home/post/' + postIndex;
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
                posts.forEach(function (post, index) {
                    posts[index] = makeResp(post);
                });
                return posts;
            }
        }
    }])
    .filter("getVideoResponsiveVersion", ['$filter', function () {
        //making embedded videos responsive
        return function (textString) {
            var theElement;
            var imgElement;
            var imgWrappedInDiv;

            function makeResp(textString) {
                //convert the element to string
                theElement = $("<div>" + textString + "</div>");

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
                return theElement.html();
            }

            if (textString) {
                return makeResp(textString)
            } else {
                return textString;
            }
        }
    }])
    .filter("highlightText", ['$filter', '$rootScope', function ($filter, $rootScope) {
        //making embedded videos responsive
        //the highlight variable should be a boolean to make the function
        //know if to highlight or not
        //if false then the function will remove highlight
        return function (theElementString, highlight) {
            //text is highlighted only if the present or previous state was search
            //this fn checks if the present or previous state was search, and returns an object with status false if not
            //if true, the returned object carries the queryString with it

            function checkSearchState() {
                //check latest state
                if ($rootScope.$state.current.name == 'home.search') {
                    return {
                        status: true,
                        queryString: $rootScope.$stateParams.queryString || ""
                    }
                } else if ($rootScope.stateHistory.length > 0) {
                    if ($rootScope.stateHistory[$rootScope.stateHistory.length - 1].hasOwnProperty('home.search')) {
                        //checking the previous state
                        return {
                            status: true,
                            queryString: $rootScope.stateHistory[$rootScope.stateHistory.length - 1]['home.search'].queryString
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
                if (highlight) {
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
                } else {
                    //remove highlight
                    var theElement3 = $("<div>" + textToHighlight + "</div>");
                    $(theElement3).removeHighlight();
                    finalString = theElement3.html();
                }

                return finalString;
            }

            return highLightThisText(theElementString);

        }
    }])
    .filter("preparePosts", ['$filter', function ($filter) {
        //making embedded videos responsive
        return function (post, posts) {
            function highlightPostTags(postTags) {
                postTags.forEach(function (tag, index) {
                    postTags[index].text = $filter('highlightText')(tag.text, true);
                });

                return postTags;
            }

            function prepare(post) {
                post.timeAgo = $filter('getTimeAgo')(post.createdAt);
                post.postDate = $filter('getPostDate')(post.createdAt);
                post.postAbsoluteUrl = $filter('getPostAbsoluteUrl')(post.postIndex);
                post.postPath = $filter('getPostPath')(post.postIndex);
                post.postHeading = $filter('highlightText')(post.postHeading, true);
                post.authorName = $filter('highlightText')(post.authorName, true);
                post.postSummary = $filter('highlightText')($filter('getVideoResponsiveVersion')(post.postSummary), true);
                post.postContent = $filter('highlightText')($filter('getVideoResponsiveVersion')(post.postContent), true);
                post.postTags = highlightPostTags(post.postTags);

                return post;
            }

            if (post) {
                return prepare(post)
            } else if (posts) {
                posts.forEach(function (post, index) {
                    posts[index] = prepare(post);
                });
                return posts;
            }
        }
    }])
    .filter("removeHighlights", ['$filter', function ($filter) {
        //making embedded videos responsive
        return function (post, posts) {
            function removePostTagsHighlight(postTags) {
                postTags.forEach(function (tag, index) {
                    postTags[index].text = $filter('highlightText')(tag.text, false);
                });

                return postTags;
            }

            function prepare(post) {
                post.timeAgo = $filter('getTimeAgo')(post.createdAt);
                post.postDate = $filter('getPostDate')(post.createdAt);
                post.postAbsoluteUrl = $filter('getPostAbsoluteUrl')(post.postIndex);
                post.postPath = $filter('getPostPath')(post.postIndex);
                post.postHeading = $filter('highlightText')(post.postHeading, false);
                post.authorName = $filter('highlightText')(post.authorName, false);
                post.postSummary = $filter('highlightText')(post.postSummary, false);
                post.postContent = $filter('highlightText')(post.postContent, false);
                post.postTags = removePostTagsHighlight(post.postTags);

                return post;
            }

            if (post) {
                return prepare(post)
            } else if (posts) {
                posts.forEach(function (post, index) {
                    posts[index] = prepare(post);
                });
                return posts;
            }
        }
    }])
    .filter("preparePostsNoChange", ['$filter', function ($filter) {
        //does not change the post to make it responsive and does not highlight
        return function (post, posts) {

            function prepare(post) {
                post.timeAgo = $filter('getTimeAgo')(post.createdAt);
                post.postDate = $filter('getPostDate')(post.createdAt);
                post.postAbsoluteUrl = $filter('getPostAbsoluteUrl')(post.postIndex);
                post.postPath = $filter('getPostPath')(post.postIndex);
                return post;
            }

            if (post) {
                return prepare(post)
            } else if (posts) {
                posts.forEach(function (post, index) {
                    posts[index] = prepare(post);
                });
                return posts;
            }
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
angular.module('clientHomeApp')

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
angular.module('clientHomeApp')

    .factory('globals', ['$q', '$location', '$window', '$rootScope', 'socketService',
        function ($q, $location, $window, $rootScope, socketService) {
            var userData = {};
            var allData = {
                documentTitle: "Negus Math - College Level Advanced Mathematics for Kenya Students",
                indexPageUrl: $location.port() ? "http://" + $location.host() + ":" + $location.port() + "/index" : $scope.indexPageUrl = "http://" + $location.host() + "/index"
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
angular.module('clientHomeApp')
    .factory('HotService', ['$filter', '$log', '$http', '$window', '$rootScope', 'socket',
        function ($filter, $log, $http, $window, $rootScope, socket) {

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
                    if (hotThisWeekArray == []) {
                        hotThisWeek = [];
                    } else {
                        hotThisWeek = $filter('preparePosts')(null, hotThisWeekArray);
                    }
                    return hotThisWeekArray;
                }
            };
        }]);
angular.module('clientHomeApp')
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
angular.module('clientHomeApp')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', '$interval', 'socket',
        function ($filter, $http, $window, $rootScope, $interval, socket) {

            var post = {};
            var posts = [];
            var postsCount = 0;
            var mainSearchResultsPosts = [];
            var mainSearchResultsPostsCount = 0;
            var suggestedPosts = [];
            var suggestedPostsCount = 0;

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

                updatePosts: function (postsArray) {
                    if (postsArray == []) {
                        posts = [];
                    } else {
                        posts = $filter('preparePosts')(null, postsArray);
                    }
                    return posts;
                },

                updatePostsCount: function (newCount) {
                    postsCount = newCount;
                    return postsCount;
                },

                addNewToPosts: function (newPost) {
                    function makePost(theNewPost) {
                        if (newPost == {}) {
                            theNewPost = {}
                        } else {
                            theNewPost = $filter('preparePosts')(theNewPost, null);
                        }
                        return theNewPost;
                    }

                    var tempPost = makePost(newPost);
                    posts.unshift(tempPost);
                    return posts;
                },

                getCurrentPost: function () {
                    return post;
                },

                getPostFromServer: function (postIndex) {
                    return $http.post('/api/getPost', {
                        postIndex: postIndex
                    });
                },

                updatePost: function (newPost) {
                    if (newPost == {}) {
                        post = {}
                    } else {
                        post = $filter('preparePosts')(newPost, null);
                    }
                    return post;
                },

                getCurrentMainSearchResults: function () {
                    return mainSearchResultsPosts;
                },

                mainSearch: function (searchObject) {
                    return $http.post('/api/mainSearch', searchObject);
                },

                updateMainSearchResults: function (resultsArray) {
                    if (resultsArray == []) {
                        mainSearchResultsPosts = [];
                    } else {
                        mainSearchResultsPosts = $filter('preparePosts')(null, resultsArray);
                    }
                    return mainSearchResultsPosts;
                },

                updateMainSearchResultsCount: function (newCount) {
                    mainSearchResultsPostsCount = newCount;
                    return mainSearchResultsPostsCount;
                },

                getSuggestedPosts: function () {
                    return suggestedPosts;
                },

                getSuggestedPostsFromServer: function () {
                    return $http.post('/api/getSuggestedPosts', {})
                },

                updateSuggestedPosts: function (suggestedPostsArray) {
                    if (suggestedPostsArray == []) {
                        suggestedPosts = [];
                    } else {
                        suggestedPosts = $filter('preparePosts')(null, suggestedPostsArray);
                    }
                    return suggestedPosts;
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
                }
            };
        }]);
angular.module('clientHomeApp')

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

                resendConfirmationEmail: function () {
                    return $http.post('/resendConfirmationEmail');
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