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
            .when("/home", '/home/1')
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



angular.module('adminHomeApp')
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
angular.module('adminHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService', 'PostService', '$document', 'cfpLoadingBar',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService, PostService, $document, cfpLoadingBar) {

            //manipulating document title
            $scope.defaultDocumentTitle = function () {
                document.title = "Negus Math - College Level Advanced Mathematics for Kenya Students";
            };

            $scope.changeDocumentTitle = function (newTitle) {
                if (newTitle) {
                    document.title = newTitle;
                }
            };

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

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.currentState = toState.name;
            });

            //back functionality
            var history = [];
            $rootScope.$on('$routeChangeSuccess', function () {
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


            //variable to hold the registered state of the client
            $scope.clientIsRegistered = false;

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
                if (bool) {
                    $('#loading-splash-card').removeClass('hidden');
                    $('.hideMobileLoading').addClass('hidden-xs hidden-sm');
                } else {
                    $('#loading-splash-card').addClass('hidden');
                    $('.hideMobileLoading').removeClass('hidden-xs hidden-sm');
                }
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
            socketService.getUserData()
                .success(function (resp) {
                    $scope.userData = globals.userData(resp.userData);
                    if ($scope.userData.isRegistered == 'yes') {
                        $scope.clientIsRegistered = true;
                    }

                    //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                    socket.emit('joinRoom', {
                        room: resp.userData.uniqueCuid
                    });

                    $scope.responseStatusHandler(resp);
                })
                .error(function (errResponse) {
                    $scope.responseStatusHandler(errResponse);
                });

            socket.on('joined', function () {
                console.log("JOIN SUCCESS");
            });

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
            //end of search functionality

            //===============new post controllers===========

            //new post
            $scope.newPost = false;
            $scope.showNewPost = function () {
                $scope.newPost = true;
            };
            $scope.hideNewPost = function () {
                $scope.newPost = false;
            };

            $scope.newPostModel = {
                postHeading: "",
                postContent: "",
                postSummary: "",
                postTags: []
            };

            //these variables hold the state of the forms
            $scope.postHeadingIsLessMin = true;
            $scope.postContentIsEmpty = true;
            $scope.postSummaryIsEmpty = true;
            $scope.postSummaryHasExceededMaximum = false;

            $scope.checkIfPostHeadingLessMin = function () {
                var postHeadingText = $scope.newPostModel.postHeading;
                if (postHeadingText.length < 10) {
                    $scope.postHeadingIsLessMin = true;
                }
                else {
                    $scope.postHeadingIsLessMin = false;
                }
                return $scope.postHeadingIsLessMin
            };

            $scope.checkIfPostContentIsEmpty = function () {
                var postContentText = $("<div>" + $scope.newPostModel.postContent + "</div>").text();
                if (postContentText.length == 0) {
                    $scope.postContentIsEmpty = true;
                }
                else {
                    $scope.postContentIsEmpty = false;
                }
                return $scope.postContentIsEmpty
            };

            $scope.checkIfPostSummaryIsEmpty = function () {
                var postSummaryText = $("<div>" + $scope.newPostModel.postSummary + "</div>").text();
                if (postSummaryText.length == 0) {
                    $scope.postSummaryIsEmpty = true;
                }
                else {
                    $scope.postSummaryIsEmpty = false;
                }
                return $scope.postSummaryIsEmpty
            };

            $scope.checkPostSummaryMaxLength = function (maxLength) {
                var postSummaryText = $("<div>" + $scope.newPostModel.postSummary + "</div>").text();
                if (postSummaryText.length > maxLength) {
                    $scope.postSummaryHasExceededMaximum = true;
                } else {
                    $scope.postSummaryHasExceededMaximum = false;
                }
                return $scope.postSummaryHasExceededMaximum
            };

            //returns true if tags pass validation
            $scope.checkEditPostTags = function () {
                var errorPostTags = 0;
                var numberOfTags = 0;

                $scope.newPostModel.postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (errorPostTags == 0) {
                        if (tag.text.length < 3 && errorPostTags == 0) {
                            errorPostTags++;
                            $scope.showToast('warning', 'Minimum required length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30 && errorPostTags == 0) {
                            errorPostTags++;
                            $scope.showToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5 && errorPostTags == 0) {
                    errorPostTags++;
                    $scope.showToast('warning', 'Only a maximum of 5 tags are allowed per post');
                }

                if (errorPostTags == 0) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.submitNewPost = function () {
                var errors = 0;
                var numberOfTags = 0;

                //validate post heading
                if ($scope.checkIfPostHeadingLessMin() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The minimum required length of the heading is 10 characters');
                }

                //validate post content
                if ($scope.checkIfPostContentIsEmpty() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'Please add some text to the post first');
                }

                //validate post summary
                if ($scope.checkIfPostSummaryIsEmpty() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The post summary cannot be empty');
                }

                if ($scope.checkPostSummaryMaxLength() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The post summary cannot exceed 2000 characters');
                }

                //validate tags
                //note that the edit post tags returns true if validation succeeded
                //it also shows toasts depending on whats missing
                if (!$scope.checkEditPostTags() && errors == 0) {
                    errors++;
                }

                if (errors == 0) {
                    var newPost = {
                        postHeading: $scope.newPostModel.postHeading,
                        postContent: $scope.newPostModel.postContent,
                        postSummary: $scope.newPostModel.postSummary,
                        postTags: $scope.newPostModel.postTags
                    };
                    PostService.submitNewPost(newPost).
                        success(function (resp) {
                            $scope.hideNewPost();
                            $scope.responseStatusHandler(resp);
                            $scope.newPostModel.postHeading = "";
                            $scope.newPostModel.postContent = "";
                            $scope.newPostModel.postSummary = "";
                        })
                        .error(function (errResponse) {
                            $scope.responseStatusHandler(errResponse);
                        })
                }
            };

            //=====================end of submitting post

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
angular.module('adminHomeApp')
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {

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
                                msg: "No more posts to show"
                            };
                            $scope.responseStatusHandler(responseMimic);
                            $scope.mainSearchResultsPosts = false;
                            getSuggestedPosts();
                            $scope.goToUniversalBanner();
                        } else {
                            $scope.posts = PostService.updatePosts(resp.postsArray);
                            $scope.showThePostsOnly();
                            updateTimeAgo();
                            if (resp.postCount) {
                                $scope.postsCount = resp.postsCount;
                            }
                            //parse the posts and prepare them, eg, making iframes responsive
                            preparePostSummaryContent();
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
                if (data.postCount) {
                    $scope.postCount = data.postCount;
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
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $scope.responseStatusHandler(errResp);
                    });
            }

            function getFullPost() {
                $scope.showHideLoadingBanner(true);
                PostService.getPostFromServer($rootScope.$stateParams.postIndex)
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
                $scope.post.postUrl = 'http://www.negusmath.com/#!/post/' + $scope.post.postIndex;
                //$scope.post.postUrl = 'http://' + $location.host() + '/#!/post/' + $scope.post.postIndex;
            }

            //==============end of update time ago

            //=============editing post====================

            //variable that holds the editing or show state in the full-post view.
            $scope.editingMode = false;

            //make copy of post, useful when the user clicks cancel
            $scope.postBackup = $scope.post;

            $scope.goIntoPostEditingMode = function () {
                //remove all the text highlights if available
                $scope.removePostHighlights($scope.post);

                //make copy of post, useful when the user clicks cancel
                $scope.postBackup = $scope.post;
                $scope.editingMode = true;
            };

            $scope.goIntoFullPostViewMode = function () {
                $scope.editingMode = false;
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
                            $scope.showToast('warning', 'Minimum allowed length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30 && errorPostTags == 0) {
                            errorPostTags++;
                            $scope.showToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5 && errorPostTags == 0) {
                    errorPostTags++;
                    $scope.showToast('warning', 'Only a maximum of 5 tags are allowed per post');
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
                    $scope.showToast('warning', 'The minimum required length of the heading is 10 characters');
                }

                //validatePostContent
                if ($scope.checkIfEditPostContentIsEmpty() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'Please add some text to the post first');
                }

                //validate postSummary
                if ($scope.checkIfEditPostSummaryIsEmpty() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The post summary cannot be empty');
                }

                if ($scope.checkEditPostSummaryMaxLength() && errors == 0) {
                    errors++;
                    $scope.showToast('warning', 'The post summary cannot exceed 2000 characters');
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
                            $scope.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.responseStatusHandler(errResponse);
                        })
                }
            };

            $scope.cancelPostUpdate = function () {
                $scope.post = $scope.postBackup;
                $scope.goIntoFullPostViewMode();
                $scope.showToast('success', 'Update cancelled');
            };

            //end of editing post functions================

            //===============socket listeners===============

            $rootScope.$on('postUpdate', function (event, data) {
                $scope.post = data.post;
                updateTimeAgo();
            });

            $rootScope.$on('reconnect', function () {
                //only update the post variable if the user is not editing the current post
                if (!$scope.editingMode) {
                    if ($scope.currentState == 'post') {
                        getFullPost();
                    }
                }
            });

            $log.info('FullPostController booted successfully');

        }
    ]);
angular.module('adminHomeApp')
    .controller('SearchController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService) {

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
angular.module('adminHomeApp')

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