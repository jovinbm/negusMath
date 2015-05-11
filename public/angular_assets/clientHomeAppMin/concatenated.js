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
        //views
        $http.get('views/client/partials/views/post_stream.html', {cache: $templateCache});
        $http.get('views/client/partials/views/full_post.html', {cache: $templateCache});
        $http.get('views/search/search_results.html', {cache: $templateCache});
    })

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .when("/home", '/home/1')
            .when("/home", '/home/1')
            .when("/search", '/home/1')
            .otherwise("/home/1");

        $stateProvider
            .state('home', {
                url: '/home/:pageNumber',
                templateUrl: 'views/client/partials/views/post_stream.html'
            })
            .state('post', {
                url: '/post/:postIndex',
                templateUrl: 'views/client/partials/views/full_post.html'
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
    });



angular.module('clientHomeApp')
    .controller('HotController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', 'HotService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, HotService) {

            $scope.hotThisWeek = HotService.getHotThisWeek();

            function getHotThisWeek() {
                HotService.getHotThisWeekFromServer()
                    .success(function (resp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek(resp.hotThisWeek);
                        updateTimeAgo();
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
                    });
            }

            getHotThisWeek();

            //=============function to update timeago on all posts
            //updates the timeago on all incoming orders using the timeago filter
            function updateTimeAgo() {
                $scope.hotThisWeek.forEach(function (hot) {
                    hot.theTimeAgo = $filter('timeago')(hot.createdAt);

                    //post date/time it was ordered e.g. Sun, Mar 17..
                    hot.postDate = moment(hot.createdAt).format("ddd, MMM D, H:mm");
                });
            }

            $interval(updateTimeAgo, 120000, 0, true);

            //==============end of update time ago

            updateTimeAgo();

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                getHotThisWeek();
            });

            $log.info('HotController booted successfully');

        }
    ]);
angular.module('clientHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$document', 'logoutService', 'cfpLoadingBar',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $document, logoutService, cfpLoadingBar) {

            //manipulating document title
            $scope.defaultDocumentTitle = function () {
                document.title = "Negus Math - College Level Advanced Mathematics for Kenya Students";
            };

            $scope.changeDocumentTitle = function (newTitle) {
                if (newTitle) {
                    document.title = newTitle;
                }
            };

            $scope.finishedLoading = function () {
                $rootScope.$broadcast('finishedLoading');
            };

            //set index landing page url
            if ($location.port()) {
                $scope.indexPageUrl = "http://" + $location.host() + ":" + $location.port() + "/index";
            } else {
                $scope.indexPageUrl = "http://" + $location.host() + "/index"
            }

            //variable to show or hide disqus if window.host contains negusmath
            $scope.showDisqus = $location.host().search("negusmath") !== -1;

            //this function returns the highlightText to the query string on the location url
            $scope.refillHighLightText = function () {
                if ($rootScope.$state.current.name == 'search' && $rootScope.$stateParams.queryString) {
                    $scope.highlightText = $rootScope.$stateParams.queryString ? $rootScope.$stateParams.queryString : $scope.highlightText;
                }
            };

            $scope.refillHighLightText();

            $scope.highlightThisText = function (textToHighlight) {
                var theElement = $("<div>" + textToHighlight + "</div>");
                $(theElement).highlight($scope.highlightText);
                return theElement.html();
            };

            $scope.removeHighLightText = function (textString) {
                $scope.highlightText = '';
                var theElement = $("<div>" + textString + "</div>");
                $(theElement).removeHighlight();
                return theElement.html();
            };

            $scope.highLightPost = function (postObject) {
                if ($scope.highLightReference()) {
                    if (postObject.authorName) {
                        postObject.authorName = $scope.highlightThisText(postObject.authorName);
                    }
                    if (postObject.postHeading) {
                        postObject.postHeading = $scope.highlightThisText(postObject.postHeading);
                    }
                    if (postObject.postContent) {
                        postObject.postContent = $scope.highlightThisText(postObject.postContent);
                    }
                    if (postObject.postSummary) {
                        postObject.postSummary = $scope.highlightThisText(postObject.postSummary);
                    }
                    if (postObject.postTags) {
                        postObject.postTags.forEach(function (tag) {
                            tag.text = $scope.highlightThisText(tag.text);
                        })
                    }
                }
            };

            $scope.removePostHighlights = function (postObject) {
                if (postObject.authorName) {
                    postObject.authorName = $scope.removeHighLightText(postObject.authorName);
                }
                if (postObject.postHeading) {
                    postObject.postHeading = $scope.removeHighLightText(postObject.postHeading);
                }
                if (postObject.postContent) {
                    postObject.postContent = $scope.removeHighLightText(postObject.postContent);
                }
                if (postObject.postSummary) {
                    postObject.postSummary = $scope.removeHighLightText(postObject.postSummary);
                }
                if (postObject.postTags) {
                    postObject.postTags.forEach(function (tag) {
                        tag.text = $scope.removeHighLightText(tag.text);
                    })
                }
            };

            //stateChangeCounter counts the stateChanges from the previous search,
            //when the user goes further, you will need to disable search highlight
            //also, you can use a timer
            $scope.stateChangeCounter = 0;
            $scope.highLightReference = function () {
                var queryString = $rootScope.$stateParams.queryString ? $rootScope.$stateParams.queryString : $scope.highlightText;
                if (queryString) {
                    //only highlight when the query string is more than 3 characters
                    if (queryString.length > 3) {
                        if ($rootScope.$state.current.name == 'search') {
                            $scope.stateChangeCounter = 0;
                            $scope.highlightText = $rootScope.$stateParams.queryString;
                            return true;
                        } else if ($scope.stateChangeCounter > 0) {
                            $scope.stateChangeCounter++;
                            return false;
                        } else {
                            $scope.stateChangeCounter++;
                            return true;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

            //listens for state changes, used to activate active states
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                //clear all banners
                $scope.clearBanners();

                //clear all toasts
                $scope.clearToasts();
            });

            //listens for state changes
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.currentState = toState.name;
            });

            //listens for a finished loading event changes
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.currentState = toState.name;
                $scope.refillHighLightText();
                $scope.fillSearchBox();
            });

            //back functionality
            var history = [];
            $rootScope.$on('$stateChangeSuccess', function () {
                history.push($location.$$path);
            });
            $rootScope.back = function () {
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
            };

            //length of an object

            $scope.calcObjectLength = function (obj) {
                var len = 0;
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        len++;
                    }
                }
                return len
            };

            //end of object lengths

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

            //scrolling to universal banner
            $scope.goToUniversalBanner = function () {
                var someElement = angular.element(document.getElementById('universalBanner'));
                $document.scrollToElement(someElement, 80, duration);
            };

            //making videos responsive
            $scope.makeVideoIframesResponsive = function (theElementString) {
                //convert the element to string
                var theElement = $("<div>" + theElementString + "</div>");

                //find the video iframe elements
                var imgElement = $('img.ta-insert-video', theElement);

                //only perform operation if there are iframes available
                if (imgElement.length > 0) {

                    //add class and wrap in div
                    var imgWrappedInDiv = imgElement
                        .addClass('embed-responsive-item')
                        .wrap("<div class='embed-responsive embed-responsive-16by9'></div>");

                    //replace in original
                    theElement.find('img').replaceWith(imgWrappedInDiv);
                }

                return theElement.html();

            };

            //===============request error handler===============

            //universalDisable variable is used to disable everything crucial in case an error
            //occurs.This is sometimes needed if a reload did not work
            $scope.universalDisable = false;

            //universal banner
            $scope.showBanner = false;
            $scope.bannerClass = "";
            $scope.bannerMessage = "";

            //registration banner
            $scope.showRegistrationBanner = false;
            $scope.registrationBannerClass = "";
            $scope.registrationBannerMessage = "";

            //new post banner
            $scope.showNewPostBanner = false;
            $scope.newPostBannerClass = "";
            $scope.newPostBannerMessage = "";

            $scope.clearBanners = function () {
                $scope.showBanner = false;
                $scope.showRegistrationBanner = false;
                $scope.showNewPostBanner = false;
            };

            $scope.universalDisableTrue = function () {
                $scope.universalDisable = true;
            };
            $scope.universalDisableFalse = function () {
                $scope.universalDisable = false;
            };

            $scope.responseStatusHandler = function (resp) {
                if (resp) {
                    if (resp.redirect) {
                        if (resp.redirect) {
                            $window.location.href = resp.redirectPage;
                        }
                    }
                    if (resp.disable) {
                        if (resp.disable) {
                            $scope.universalDisableTrue();
                        }
                    }
                    if (resp.notify) {
                        if (resp.type && resp.msg) {
                            $scope.showToast(resp.type, resp.msg);
                        }
                    }
                    if (resp.banner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showBanner = true;
                            $scope.bannerClass = resp.bannerClass;
                            $scope.bannerMessage = resp.msg;
                        }
                    }
                    if (resp.newPostBanner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showNewPostBanner = true;
                            $scope.newPostBannerClass = resp.bannerClass;
                            $scope.newPostBannerMessage = resp.msg;
                        }
                    }
                    if (resp.registrationBanner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showRegistrationBanner = true;
                            $scope.registrationBannerClass = resp.bannerClass;
                            $scope.registrationBannerMessage = resp.msg;
                        }
                    }
                    if (resp.reason) {
                        $log.warn(resp.reason);
                    }
                } else {
                    //do nothing
                }
            };

            $rootScope.$on('responseStatusHandler', function (event, resp) {
                $scope.responseStatusHandler(resp);
            });


            //===============end of request error handler===============


            //===============isLoading functions to disable elements while content is loading or processing===============
            $scope.isLoading = false;
            $scope.isLoadingPercentage = 0;
            $scope.changeIsLoadingPercentage = function (num) {
                $scope.isLoadingPercentage = num;
            };

            //hides or shows the loading splash screen
            $scope.showHideLoadingBanner = function (bool) {
                $scope.showHideLoadingBanner = function (bool) {
                    if (bool) {
                        $('#loading-splash-card').removeClass('hidden');
                        $('.hideMobileLoading').addClass('hidden-xs hidden-sm');
                    } else {
                        $('#loading-splash-card').addClass('hidden');
                        $('.hideMobileLoading').removeClass('hidden-xs hidden-sm');
                    }
                };
            };

            $rootScope.$on('cfpLoadingBar:loading', function (event, resp) {
                $scope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:loaded', function (event, resp) {
                $scope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $rootScope.$on('cfpLoadingBar:completed', function (event, resp) {
                $scope.isLoadingPercentage = cfpLoadingBar.status() * 100
            });

            $scope.isLoadingTrue = function () {
                $scope.isLoading = true;
            };
            $scope.isLoadingFalse = function () {
                $scope.isLoading = false;
            };

            $rootScope.$on('isLoadingTrue', function () {
                $scope.isLoading = true;
            });

            $rootScope.$on('isLoadingFalse', function () {
                $scope.isLoading = false;
            });

            //===============end of isLoading functions===============

            //===============toastr show functions===============

            $scope.clearToasts = function () {
                toastr.clear();
            };

            $scope.showToast = function (toastType, text) {
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

            $rootScope.$on('showToast', function (event, data) {
                var toastType = data.toastType;
                var text = data.text;

                $scope.showToast(toastType, text);
            });

            //===============end of toastr show functions===============

            //************time functions****************
            $scope.currentTime = "";

            //set current Date
            $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            var updateCurrentTime = function () {
                $scope.currentTime = moment().format("ddd, MMM D, H:mm");
            };
            $interval(updateCurrentTime, 20000, 0, true);

            //***************end time functions***********************

            //initial requests
            function initialRequests() {
                socketService.getUserData()
                    .success(function (resp) {
                        $scope.userData = globals.userData(resp.userData);
                        if ($scope.userData.isRegistered == 'yes') {
                            $scope.clientIsRegistered = true;
                        } else {
                            $scope.clientIsRegistered = false;
                        }

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


            //function to go to landing page
            $scope.goToLandingPage = function () {
                $window.location.href = 'index';
            };


            //search functionality
            $scope.mainSearchModel = {
                queryString: "",
                postSearchUniqueCuid: "",
                requestedPage: 1
            };

            //put the query string in the search box
            $scope.fillSearchBox = function () {
                if ($rootScope.$state.current.name == 'search' && $rootScope.$stateParams.queryString) {
                    $scope.mainSearchModel.queryString = $rootScope.$stateParams.queryString ? $rootScope.$stateParams.queryString : $scope.highlightText;
                } else {
                    $scope.mainSearchModel.queryString = '';
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

            //==================================================paging controllers for posts
            $scope.showPaging = false;
            $scope.showThePager = function () {
                $scope.showPaging = true;
            };
            $scope.hideThePager = function () {
                $scope.showPaging = false;
            };
            $scope.pagingMaxSize = 5;
            $scope.numPages = 5;
            $scope.itemsPerPage = 10;
            $scope.pagingTotalCount = 1;
            $scope.changePagingTotalCount = function (newTotalCount) {
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
            //=======================================================end of post paging controllers

            //===============logout functions===============
            $scope.logoutClient = function () {
                logoutService.logoutClient()
                    .success(function (resp) {
                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            };

            //=============end of logout===================

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
            });

            $log.info('MainController booted successfully');

        }
    ]);
angular.module('clientHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {

            //show paging
            $scope.showThePager();

            //change to default document title
            $scope.defaultDocumentTitle();

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

            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
            function preparePostSummaryContent() {
                $scope.posts.forEach(function (post) {
                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                });
            }

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
                            updateTimeAgo();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function prepareSuggestedPostsSummaryContent() {
                                $scope.suggestedPosts.forEach(function (post) {
                                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                                });
                            }

                            prepareSuggestedPostsSummaryContent();
                            $scope.finishedLoading();
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToUniversalBanner();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        $scope.showHideLoadingBanner(false);
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });
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
                                msg: "No posts available for this page"
                            };
                            $scope.responseStatusHandler(responseMimic);
                            $scope.mainSearchResultsPosts = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
                            $scope.showThePostsOnly();
                            updateTimeAgo();
                            if (resp.postsCount) {
                                $scope.postsCount = resp.postsCount;
                                $scope.changePagingTotalCount($scope.postsCount);
                            }
                            //parse the posts and prepare them, eg, making iframes responsive
                            preparePostSummaryContent();
                            $scope.finishedLoading();
                        }
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.posts = [];
                        $scope.mainSearchResultsPosts = false;
                        getSuggestedPosts();
                    });
            }

            getPagePosts();

            //this functions evaluates to true if object is not empty, useful for ng-show
            //this function also creates a banner to notify user that there are no posts by mimicing a response and calling the response handler
            $scope.checkIfPostsIsEmpty = function () {
                return $scope.posts.length == 0
            };

            //=============function to update timeago on all posts
            //updates the timeago on all incoming orders using the timeago filter
            function updateTimeAgo() {
                $scope.posts.forEach(function (post) {
                    post.theTimeAgo = $filter('timeago')(post.createdAt);

                    //post date/time it was ordered e.g. Sun, Mar 17..
                    post.postDate = moment(post.createdAt).format("ddd, MMM D, H:mm");
                });
            }

            $interval(updateTimeAgo, 120000, 0, true);

            //==============end of update time ago

            updateTimeAgo();

            //===============socket listeners===============

            $rootScope.$on('newPost', function (event, data) {
                //newPost goes to page 1, so update only if the page is 1
                if ($rootScope.$stateParams.pageNumber == 1) {
                    $scope.posts.unshift(data.post);
                    updateTimeAgo();
                    preparePostSummaryContent();
                }
                if (data.postsCount) {
                    $scope.postsCount = data.postsCount;
                    $scope.changePagingTotalCount($scope.postsCount);
                }
            });

            $rootScope.$on('reconnect', function () {
                if ($scope.currentState == 'home') {
                    getPagePosts();
                }
            });

            $log.info('PostController booted successfully');

        }
    ])

    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {

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
                            updateTimeAgo();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function prepareSuggestedPostsSummaryContent() {
                                $scope.suggestedPosts.forEach(function (post) {
                                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                                });
                            }

                            prepareSuggestedPostsSummaryContent();
                            $scope.finishedLoading();
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToUniversalBanner();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        $scope.showHideLoadingBanner(false);
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });
            }

            function getFullPost() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostFromServer($scope.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $scope.responseStatusHandler(resp);
                        //check that there is a post first before starting disqus and other attributes
                        if ($scope.calcObjectLength($scope.post) != 0) {

                            //change the document title
                            $scope.changeDocumentTitle($scope.post.postHeading);

                            $scope.showThePostOnly();
                            updateTimeAgo();
                            addPostUrl();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function preparePostContent() {
                                $scope.post.postContent = $scope.makeVideoIframesResponsive($scope.post.postContent);
                            }

                            preparePostContent();

                            //highlight the post if needed
                            $scope.highLightPost($scope.post);

                            //check first that this is a production env --> showDisqus before bootstrapping disqus
                            if ($scope.showDisqus) {
                                $scope.postIsLoaded = true;
                            }

                            $scope.finishedLoading();

                        } else {
                            //empty the post
                            $scope.post = {};
                            $scope.showPost = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                        }

                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                        //empty the post
                        $scope.post = {};
                        $scope.showPost = false;
                        getSuggestedPosts();
                    });
            }

            getFullPost();

            //=============function to update timeago on this post
            function updateTimeAgo() {
                if ($scope.post) {
                    $scope.post.theTimeAgo = $filter('timeago')($scope.post.createdAt);

                    //post date/time it was ordered e.g. Sun, Mar 17..
                    $scope.post.postDate = moment($scope.post.createdAt).format("ddd, MMM D, H:mm");
                }

                if ($scope.suggestedPosts) {
                    $scope.suggestedPosts.forEach(function (post) {
                        post.theTimeAgo = $filter('timeago')(post.createdAt);

                        //post date/time it was ordered e.g. Sun, Mar 17..
                        post.postDate = moment(post.createdAt).format("ddd, MMM D, H:mm");
                    });
                }
            }

            $interval(updateTimeAgo, 120000, 0, true);

            function addPostUrl() {
                //$scope.post.postUrl = 'http://' + $location.host() + '/#!/post/' + $scope.post.postIndex;
                $scope.post.postUrl = 'http://www.negusmath.com/#!/post/' + $scope.post.postIndex;
            }

            //==============end of update time ago

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                $scope.post = data.post;
                updateTimeAgo();
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                //the $scope.currentState is defined in main controller
                if (!$scope.editingMode && $scope.currentState == 'post') {
                    getFullPost();
                }
            });

            $log.info('FullPostController booted successfully');

        }
    ]);
angular.module('clientHomeApp')
    .controller('SearchController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {

            //show paging
            $scope.showThePager();

            $scope.mainSearchModel = {
                queryString: $rootScope.$stateParams.queryString || '',
                postSearchUniqueCuid: "",
                requestedPage: $rootScope.$stateParams.pageNumber || 1
            };

            //change to default document title
            $scope.changeDocumentTitle($rootScope.$stateParams.queryString + " - NegusMath Search");

            $scope.mainSearchResultsPosts = PostService.getCurrentPosts();
            $scope.mainSearchResultsCount = 0;

            $scope.changeCurrentPage = function (page) {
                if (page != $rootScope.$stateParams.pageNumber) {
                    //change page here******************************
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

            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
            function preparePostSummaryContent() {
                $scope.mainSearchResultsPosts.forEach(function (post) {
                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                });
            }

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
                            updateTimeAgo();

                            //function that parses and prepares the post content e.g. making iframes in html string to be responsive
                            function prepareSuggestedPostsSummaryContent() {
                                $scope.suggestedPosts.forEach(function (post) {
                                    post.postSummary = $scope.makeVideoIframesResponsive(post.postSummary);
                                });
                            }

                            prepareSuggestedPostsSummaryContent();
                            $scope.finishedLoading();
                        } else {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = [];
                            $scope.showSuggestedPosts = false;
                            $scope.goToUniversalBanner();
                            $scope.showHideLoadingBanner(false);
                        }

                    })
                    .error(function (errResp) {
                        $scope.goToUniversalBanner();
                        $scope.showHideLoadingBanner(false);
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });
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
                        //change paging total count
                        $scope.changePagingTotalCount($scope.mainSearchResultsCount);

                        $scope.changeCurrentPage(theResult.page);
                        $scope.mainSearchModel.postSearchUniqueCuid = theResult.searchUniqueCuid;

                        //the response is the resultValue
                        if (theResult.totalResults > 0) {
                            $scope.mainSearchResultsPosts = theResult.postsArray;
                            $scope.showMainSearchResultsOnly();
                            updateTimeAgo();
                            //parse the posts and prepare them, eg, making iframes responsive
                            preparePostSummaryContent();
                            $scope.mainSearchResultsPosts.forEach(function (post) {
                                $scope.highLightPost(post);
                            });

                            var responseMimic1 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned " + $scope.mainSearchResultsCount + " results"
                            };
                            $scope.responseStatusHandler(responseMimic1);
                            $scope.finishedLoading();
                        } else {
                            //empty the postsArray
                            $scope.mainSearchResultsPosts = [];
                            var responseMimic2 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned 0 results"
                            };
                            $scope.responseStatusHandler(responseMimic2);
                            $scope.showMainSearchResults = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                            $scope.finishedLoading();
                        }
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
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

            //=============function to update timeago on all posts
            //updates the timeago on all incoming orders using the timeago filter
            function updateTimeAgo() {
                $scope.mainSearchResultsPosts.forEach(function (post) {
                    post.theTimeAgo = $filter('timeago')(post.createdAt);

                    //post date/time it was ordered e.g. Sun, Mar 17..
                    post.postDate = moment(post.createdAt).format("ddd, MMM D, H:mm");
                });
            }

            $interval(updateTimeAgo, 120000, 0, true);

            //==============end of update time ago

            updateTimeAgo();

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                if ($scope.currentState == 'search') {
                    getMainSearchResults();
                }
            });

            $log.info('SearchController booted successfully');

        }
    ]);
angular.module('clientHomeApp')

    .factory('globals', ['$q', '$window', '$rootScope', 'socketService',
        function ($q, $window, $rootScope, socketService) {
            var userData = {};
            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                }
            };
        }]);
angular.module('clientHomeApp')
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