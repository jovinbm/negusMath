angular.module('mainApp', [
    'ui.bootstrap',
    'cfp.loadingBar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'textAngular',
    'ngSanitize',
    'angularUtils.directives.dirDisqus',
    'ngTagsInput',
    'ui.utils',
    'ngFileUpload'
])
    .run(['$templateCache', '$http', '$rootScope', '$state', '$stateParams', function ($templateCache, $http, $rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.Utils = {
            keys: Object.keys
        }
    }])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
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
    }]);
angular.module('mainApp')
    .directive('logoutScope', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutService.logoutClient()
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };
            }
        }
    }]);
angular.module('mainApp')
    .controller('PopularStoriesController', ['$q', '$log', '$scope', '$rootScope', 'PopularStoriesService', 'globals',
        function ($q, $log, $scope, $rootScope, PopularStoriesService, globals) {

            $scope.popularStories = PopularStoriesService.getPopularStories();

            function getPopularStories() {
                PopularStoriesService.getPopularStoriesFromServer()
                    .success(function (resp) {
                        $scope.popularStories = PopularStoriesService.updatePopularStories(resp.popularStories);
                    })
                    .error(function (errResp) {
                        $scope.popularStories = PopularStoriesService.updatePopularStories([]);
                        $rootScope.main.responseStatusHandler(errResp);
                    });
            }

            getPopularStories();

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                getPopularStories();
            });
        }
    ]);
angular.module('mainApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'socketService', 'globals', '$document',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, socketService, globals, $document) {

            //index page url
            $scope.indexPageUrl = globals.allData.indexPageUrl;

            //website host
            $rootScope.currentHost = globals.getLocationHost();

            //disqus
            $scope.showDisqus = $location.host().search("negusmath") !== -1;

            //scrolling functions
            var duration = 0; //milliseconds
            var offset = 40; //pixels; adjust for floating menu, context etc
            //Scroll to #some-id with 30 px "padding"
            //Note: Use this in a directive, not with document.getElementById

            $rootScope.main = {
                currentTime: "",

                showLoadingBannerDir: false,

                showLoadingBanner: function () {
                    this.showLoadingBannerDir = true;
                },

                hideLoadingBanner: function () {
                    this.showLoadingBannerDir = false;
                },

                goToTop: function () {
                    var someElement = angular.element(document.getElementById('top'));
                    $document.scrollToElement(someElement, 80, duration);
                },

                broadcastUserData: function () {
                    $rootScope.$broadcast('userDataChanges');
                },

                responseStatusHandler: function (resp) {
                    $filter('responseFilter')(resp);
                },

                clearBanners: function () {
                    $rootScope.$broadcast('clearBanners');
                },

                isLoading: true,

                startLoading: function () {
                    this.isLoading = true;
                },

                finishedLoading: function () {
                    $rootScope.isLoading = false;
                },

                redirectToPage: function (pathWithFirstSlash) {
                    $window.location.href = globals.getLocationHost() + pathWithFirstSlash;
                }

            };

            //=====================time functions=======================
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
                        $rootScope.main.broadcastUserData();

                        if ($scope.userData.isRegistered) {
                            //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                            socket.emit('joinRoom', {
                                room: resp.userData.uniqueCuid
                            });
                        }

                        $rootScope.main.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
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
                window.history.back();
            };

            $rootScope.backAngular = function () {
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.main.clearBanners();
                $rootScope.clearToasts();

                //variable to keep track of when the user is editing the post
                $rootScope.isEditingPost = false;
            });

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                initialRequests();
            });
        }
    ]);

angular.module('mainApp')
    .controller('SearchController', ['$q', '$log', '$scope', '$rootScope', 'globals', 'PostService',
        function ($q, $log, $scope, $rootScope, globals, PostService) {
        }
    ]);
angular.module('mainApp')
    .controller('UserManagerController', ['$q', '$scope', '$rootScope', 'UserService', 'globals',
        function ($q, $scope, $rootScope, UserService, globals) {

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                if (globals.checkAccountStatus()) {
                    UserService.getUsersCountFromServer()
                        .success(function (resp) {
                            $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
            }

            getUsersCount();

            //===============socket listeners===============

            $rootScope.$on('userChanges', function () {
                getUsersCount();
            });

            $rootScope.$on('reconnect', function () {
            });
        }
    ]);
angular.module('mainApp')
    .filter("timeago", [function () {
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
    }])
    .filter("getTimeAgo", ['$filter', function ($filter) {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (createdAt) {
            return $filter('timeago')(createdAt);
        }
    }])
    .filter("getPostDate", [function () {
        //takes in a post or an array of posts, and adds a timeAgo key in them
        return function (createdAt) {
            return moment(createdAt).format("ddd, MMM D, H:mm");
        }
    }])
    .filter("getPostAbsoluteUrl", [function () {
        return function (postIndex) {
            return 'http://www.negusmath.com/#!/home/post/' + postIndex;
        }
    }])
    .filter("getPostPath", [function () {
        return function (postIndex) {
            return '/#!/home/post/' + postIndex;
        }
    }])
    .filter("makeVideoIframesResponsive", [function () {
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
                if (Object.keys(post).length > 0) {
                    return makeResp(post);
                } else {
                    return post;
                }
            } else if (posts) {
                posts.forEach(function (post, index) {
                    if (Object.keys(post).length > 0) {
                        posts[index] = makeResp(post);
                    }
                });
                return posts;
            }
        }
    }])
    .filter("getVideoResponsiveVersion", [function () {
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
    .filter("highlightText", ['$rootScope', function ($rootScope) {
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
                    //check if previous state was search and current state is post
                    if ($rootScope.stateHistory[$rootScope.stateHistory.length - 1].hasOwnProperty('home.search') && $rootScope.$state.current.name == 'home.post') {
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
                if (postTags.length > 0) {
                    postTags.forEach(function (tag, index) {
                        postTags[index].text = $filter('highlightText')(tag.text, true);
                    });
                }

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
                if (Object.keys(post).length > 0) {
                    return prepare(post);
                } else {
                    return post;
                }
            } else if (posts) {
                posts.forEach(function (post, index) {
                    if (Object.keys(post).length > 0) {
                        posts[index] = prepare(post);
                    }
                });
                return posts;
            }
        }
    }])
    .filter("preparePostSummary", ['$filter', function ($filter) {
        //making embedded videos responsive in postContent
        return function (postSummary) {

            console.log("postSummary called");

            function prepare(postContent) {
                return $filter('highlightText')($filter('getVideoResponsiveVersion')(postSummary), true);
            }

            if (postSummary) {
                return prepare(postSummary);
            } else {

                return postSummary;
            }
        }
    }])
    .filter("preparePostContent", ['$filter', function ($filter) {
        //making embedded videos responsive in postContent
        return function (postContent) {

            function prepare(postContent) {
                return $filter('highlightText')($filter('getVideoResponsiveVersion')(postContent), true);
            }

            if (postContent) {
                return prepare(postContent);
            } else {

                return postContent;
            }
        }
    }])
    .filter("removeHighlights", ['$filter', function ($filter) {
        //making embedded videos responsive
        return function (post, posts) {
            function removePostTagsHighlight(postTags) {
                if (postTags.length > 0) {
                    postTags.forEach(function (tag, index) {
                        postTags[index].text = $filter('highlightText')(tag.text, false);
                    });
                }

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
                if (Object.keys(post).length > 0) {
                    return prepare(post);
                } else {
                    return post;
                }
            } else if (posts) {
                posts.forEach(function (post, index) {
                    if (Object.keys(post).length > 0) {
                        posts[index] = prepare(post);
                    }
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
                if (Object.keys(post).length > 0) {
                    return prepare(post);
                } else {
                    return post;
                }
            } else if (posts) {
                posts.forEach(function (post, index) {
                    if (Object.keys(post).length > 0) {
                        posts[index] = prepare(post);
                    }
                });
                return posts;
            }
        }
    }])
    .filter("responseFilter", ['$q', '$log', '$window', '$rootScope', function ($q, $log, $window, $rootScope) {
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
angular.module('mainApp')
    .filter("validatePostHeading", ['$rootScope', function ($rootScope) {
        return function (postHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            if (postHeading) {
                if (postHeading.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The heading is required');
                }
                if (errors == 0) {
                    if (postHeading.length < 10) {
                        broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
                        errors++;
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The heading is required');
            }
            return errors == 0;
        }
    }])
    .filter("postHeadingMessages", [function () {
        return function (postHeading) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postHeading) {
                var postHeadingText = $("<div>" + postHeading + "</div>").text();

                if (postHeadingText.length == 0) {
                    addMessage('The is a required field');
                }
                if (postHeadingText.length > 0 && postHeadingText.length < 10) {
                    addMessage('Minimum length required is 10 characters');
                }
            } else {
                addMessage('The is a required field');
            }
            return messages;

        }
    }])
    .filter("validatePostContent", ['$rootScope', function ($rootScope) {
        return function (postContent, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            if (postContent) {
                var postContentText = $("<div>" + postContent + "</div>").text();
                if (postContentText.length == 0) {
                    broadcastShowToast('warning', 'Please add some text to the post first');
                }
                return postContentText.length > 0;
            } else {
                broadcastShowToast('warning', 'Please add some text to the post first');
                return false;
            }
        }
    }])
    .filter("postContentMessages", [function () {
        return function (postContent) {
            if (postContent) {
                var postContentText = $("<div>" + postContent + "</div>").text();
                if (postContentText.length == 0) {
                    return "This is a required field"
                } else {
                    return "";
                }
            } else {
                return "This is a required field"
            }
        }
    }])
    .filter("validatePostSummary", ['$rootScope', function ($rootScope) {
        return function (postSummary, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            if (postSummary) {
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
            } else {
                errors++;
                broadcastShowToast('warning', 'The post summary cannot be empty');
            }
            return errors == 0;
        }
    }])
    .filter("postSummaryMessages", [function () {
        return function (postSummary) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postSummary) {
                var postSummaryText = $("<div>" + postSummary + "</div>").text();

                if (postSummaryText.length == 0) {
                    addMessage('The post summary cannot be empty');
                }
                if (postSummaryText.length > 2000) {
                    addMessage('The post summary cannot exceed 2000 characters');
                }
            } else {
                addMessage('The post summary cannot be empty');
            }
            return messages;

        }
    }])
    .filter("validatePostTags", ['$rootScope', function ($rootScope) {
        return function (postTags, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var numberOfTags = 0;

            if (postTags) {
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
            } else {
                return true;
            }

            return errors == 0;
        }
    }])
    .filter("postTagsMessages", [function () {
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

            if (postTags) {
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
            }

            return messages;
        }
    }]);
angular.module('mainApp')
    .factory('fN', [
        function () {
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
        }
    ]);
angular.module('mainApp')
    .factory('globals', ['$q', '$location', '$rootScope',
        function ($q, $location, $rootScope) {
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
                },

                getLocationHost: function () {
                    if (document.location.hostname.search("negusmath") !== -1) {
                        return "//www.negusmath.com";
                    } else {
                        if ($location.port()) {
                            return 'http://localhost' + ":" + $location.port();
                        } else {
                            return 'http://localhost';
                        }
                    }
                },

                checkAccountStatus: function () {
                    function getStatus(userData) {
                        if (userData && Object.keys(userData) > 0) {
                            if (userData.isRegistered) {
                                if (!userData.emailIsConfirmed) {
                                    return {
                                        show: true,
                                        bannerClass: "alert alert-warning",
                                        msg: "Please confirm your account by clicking the confirmation link we sent on your email. Please also check your spam folder",
                                        showResendEmail: true,
                                        accountStatus: false
                                    };
                                } else if (userData.isApproved === false) {
                                    return {
                                        show: true,
                                        bannerClass: "alert alert-warning",
                                        msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved.",
                                        showResendEmail: false,
                                        accountStatus: false
                                    };
                                } else if (userData.isBanned) {
                                    if (userData.isBanned.status === true) {
                                        //checking banned status
                                        return {
                                            show: true,
                                            bannerClass: "alert alert-warning",
                                            msg: "Your have been banned from this service. Please contact the administrators for more information",
                                            showResendEmail: false,
                                            accountStatus: false
                                        };
                                    } else {
                                        return {
                                            show: false,
                                            bannerClass: "",
                                            msg: "",
                                            showResendEmail: false,
                                            accountStatus: true
                                        };
                                    }
                                } else {
                                    return {
                                        show: false,
                                        bannerClass: "",
                                        msg: "",
                                        showResendEmail: false,
                                        accountStatus: true
                                    };
                                }
                            } else {
                                console.log(userData);
                                return {
                                    show: true,
                                    bannerClass: "alert alert-warning",
                                    msg: "You are not registered. Please reload this page to create an account",
                                    showResendEmail: false,
                                    accountStatus: false
                                };
                            }
                        } else {
                            //userData might not have loaded yet here, forgive this part
                            return {
                                show: false,
                                bannerClass: "",
                                msg: "",
                                showResendEmail: false,
                                accountStatus: true
                            };
                        }
                    }

                    var theStatus = getStatus(userData);
                    $rootScope.$broadcast('universalBanner', theStatus);
                    return theStatus.accountStatus;
                }
            };
        }
    ]);
angular.module('mainApp')
    .factory('mainService', ['$log', '$window', '$rootScope', 'socket',
        function ($log, $window, $rootScope, socket) {

            socket.on('reconnect', function () {
                $log.info("'reconnect sequence' triggered");
                $rootScope.$broadcast('reconnect');
            });

            return {
                done: function () {
                    return 1;
                }
            };
        }
    ]);
angular.module('mainApp')
    .factory('PopularStoriesService', ['$filter', '$log', '$http', '$window', '$rootScope', 'socket',
        function ($filter, $log, $http, $window, $rootScope, socket) {

            var popularStories = [];

            return {

                getPopularStories: function () {
                    return popularStories;
                },

                getPopularStoriesFromServer: function () {
                    return $http.post('/api/getPopularStories', {})
                },

                updatePopularStories: function (popularStoriesArray) {
                    if (popularStoriesArray == []) {
                        popularStories = [];
                    } else {
                        popularStories = $filter('preparePostsNoChange')(null, popularStoriesArray);
                    }
                    return popularStoriesArray;
                }
            };
        }
    ]);
angular.module('mainApp')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', 'socket', 'globals',
        function ($filter, $http, $window, $rootScope, socket, globals) {

            var post = {};
            var editPostModel = {};
            var allPosts = {};
            var allPostsCount = 0;
            var suggestedPosts = {};
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

                getAllPosts: function () {
                    return allPosts;
                },

                getPosts: function (pageNumber) {
                    if (pageNumber) {
                        return allPosts[pageNumber];
                    } else {
                        return [];
                    }
                },

                getAllPostsCount: function () {
                    return allPostsCount;
                },

                getPostsFromServer: function (getModelObject) {
                    var pageNumber = getModelObject.requestedPage;
                    return $http.get('/partial/posts/' + pageNumber)
                },

                updatePosts: function (postsArray, pageNumber) {
                    if (postsArray == []) {
                        allPosts[pageNumber] = [];
                    } else {
                        allPosts[pageNumber] = $filter('preparePosts')(null, postsArray);
                    }
                    return allPosts[pageNumber];
                },

                removePostWithUniqueCuid: function (postUniqueCuid) {
                    var found = 0;
                    for (var pageNumber in allPosts) {
                        if (found == 0) {
                            if (allPosts.hasOwnProperty(pageNumber)) {
                                allPosts[pageNumber].forEach(function (post, index) {
                                    if (found == 0) {
                                        if (post.postUniqueCuid == postUniqueCuid) {
                                            allPosts[pageNumber].splice(index, 1);
                                            ++found;
                                        }
                                    }
                                });
                            }
                        }
                    }
                },

                updateAllPostsCount: function (newCount) {
                    allPostsCount = newCount;
                    return allPostsCount;
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
                    //unshift in firstPage
                    allPosts['1'].unshift(tempPost);
                    return allPosts;
                },

                getCurrentPost: function (postIndex) {
                    if (postIndex) {
                        return post[postIndex]
                    } else {
                        return {};
                    }
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
                        post[newPost.postIndex] = $filter('preparePosts')(newPost, null);
                    }
                    return post[newPost.postIndex];
                },

                getCurrentEditPostModel: function () {
                    if (editPostModel == {}) {
                        return {}
                    } else {
                        return editPostModel;
                    }
                },

                getCurrentEditPostModelFromServer: function (postIndex) {
                    return $http.post('/api/getPost', {
                        postIndex: postIndex
                    });
                },

                updateCurrentEditPostModel: function (newPost) {
                    if (newPost == {}) {
                        editPostModel = {}
                    } else {
                        editPostModel = $filter('preparePostsNoChange')(newPost, null);
                    }
                    return editPostModel;
                },

                postSearch: function (searchObject) {
                    var queryString = searchObject.queryString;
                    var pageNumber = searchObject.requestedPage;
                    return $http.get('/partial/search/posts/' + queryString + '/' + pageNumber);
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
                        suggestedPosts = $filter('preparePostsNoChange')(null, suggestedPostsArray);
                    }
                    return suggestedPosts;
                },

                //admin actions

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

                trashPost: function (postUniqueCuid) {
                    return $http.post('/api/trashPost', {
                        postUniqueCuid: postUniqueCuid
                    });
                },

                unTrashPost: function (postUniqueCuid) {
                    return $http.post('/api/unTrashPost');
                }
            };
        }
    ]);
angular.module('mainApp')
    .factory('socket', ['$log', '$location', '$rootScope',
        function ($log, $location, $rootScope) {
            var url;

            if (document.location.hostname.search("negusmath") !== -1) {
                url = "//www.negusmath.com";
            } else {
                if ($location.port()) {
                    url = 'http://localhost' + ":" + $location.port();
                } else {
                    url = 'http://localhost';
                }
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
        }
    ])


    .factory('socketService', ['$log', '$http', '$rootScope',
        function ($log, $http, $rootScope) {
            return {

                getUserData: function () {
                    return $http.get('/api/getUserData');
                },

                resendConfirmationEmail: function (userUniqueCuid) {
                    return $http.post('/resendConfirmationEmail', {
                        userUniqueCuid: userUniqueCuid
                    });
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
        }
    ]);
angular.module('mainApp')
    .factory('uploadService', ['$q', '$location', 'Upload', 'globals',
        function ($q, $location, Upload, globals) {
            return {
                uploadPostImage: function (fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadPostImage',
                        fields: fields,
                        file: file
                    });
                },

                uploadPdf: function (fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadPdf',
                        fields: fields,
                        file: file
                    });
                },

                uploadZip: function (fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadZip',
                        fields: fields,
                        file: file
                    });
                }
            }
        }
    ]);
angular.module('mainApp')
    .factory('UserService', ['$filter', '$http',
        function ($filter, $http) {

            var usersCount = {};
            var allUsers = [];
            var adminUsers = [];
            var usersNotApproved = [];
            var bannedUsers = [];

            return {

                getUsersCount: function () {
                    return usersCount;
                },

                getUsersCountFromServer: function () {
                    return $http.post('/api/getUsersCount', {})
                },

                updateUsersCount: function (newUsersCount) {
                    usersCount = newUsersCount;
                    return usersCount;
                },

                getAllUsers: function () {
                    return allUsers;
                },

                getAllUsersFromServer: function () {
                    return $http.post('/api/getAllUsers', {})
                },

                updateAllUsers: function (usersArray) {
                    allUsers = usersArray;
                    return allUsers;
                },

                getAdminUsers: function () {
                    return adminUsers;
                },

                getAdminUsersFromServer: function () {
                    return $http.post('/api/getAdminUsers', {})
                },

                updateAdminUsers: function (usersArray) {
                    adminUsers = usersArray;
                    return adminUsers;
                },

                getUsersNotApproved: function () {
                    return usersNotApproved;
                },

                getUsersNotApprovedFromServer: function () {
                    return $http.post('/api/getUsersNotApproved', {})
                },

                updateUsersNotApproved: function (usersArray) {
                    usersNotApproved = usersArray;
                    return usersNotApproved;
                },

                getBannedUsers: function () {
                    return bannedUsers;
                },

                getBannedUsersFromServer: function () {
                    return $http.post('/api/getBannedUsers', {})
                },

                updateBannedUsers: function (usersArray) {
                    bannedUsers = usersArray;
                    return bannedUsers;
                },

                addAdminPrivileges: function (userUniqueCuid) {
                    return $http.post('/api/addAdminPrivileges', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                removeAdminPrivileges: function (userUniqueCuid) {
                    return $http.post('/api/removeAdminPrivileges', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                approveUser: function (userUniqueCuid) {
                    return $http.post('/api/approveUser', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                banUser: function (userUniqueCuid) {
                    return $http.post('/api/banUser', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                unBanUser: function (userUniqueCuid) {
                    return $http.post('/api/unBanUser', {
                        userUniqueCuid: userUniqueCuid
                    })
                }
            };
        }
    ]);
angular.module('mainApp')
    .directive('newPostBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/all/partials/templates/new_post_banner.html',
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
            templateUrl: 'views/all/partials/templates/loading_banner.html',
            restrict: 'AE',
            controller: controller
        }
    }]);
angular.module('mainApp')
    .directive('editPostDirectiveScope', ['$q', '$filter', '$log', '$window', '$location', '$rootScope', 'globals', 'PostService',
        function ($q, $filter, $log, $window, $location, $rootScope, globals, PostService) {
            return {
                restrict: 'AE',
                link: function ($scope, $element, $attrs) {

                    $scope.editPostModel = PostService.getCurrentEditPostModel();

                    function getFullEditPostModel() {
                        PostService.getCurrentEditPostModelFromServer($scope.postIndex)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                if (Object.keys(resp.thePost).length > 0) {
                                    $scope.editPostModel = PostService.updateCurrentEditPostModel(resp.thePost);
                                } else {
                                    //empty the post
                                    $scope.editPostModel = PostService.updateCurrentEditPostModel({});
                                }
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                //empty the post
                                $scope.editPostModel = PostService.updateCurrentEditPostModel({});
                            });
                    }

                    getFullEditPostModel();


                    $scope.cancelPostUpdate = function () {
                        $rootScope.showToast('success', 'Update cancelled');
                        if ($location.port()) {
                            $window.location.href = "http://" + $location.host() + ":" + $location.port() + $scope.editPostModel.postPath;
                        } else {
                            $window.location.href = "http://" + $location.host() + $scope.editPostModel.postPath
                        }
                    };

                    $scope.validateEditForm = function (notify) {
                        var errors = 0;
                        if (!$filter("validatePostHeading")($scope.editPostModel.postHeading, notify)) {
                            errors++;
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostContent")($scope.editPostModel.postContent, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostSummary")($scope.editPostModel.postSummary, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostTags")($scope.editPostModel.postTags, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };

                    $scope.submitPostUpdate = function () {
                        if ($scope.validateEditForm(true) && globals.checkAccountStatus()) {
                            PostService.submitPostUpdate($scope.editPostModel)
                                .success(function (resp) {
                                    $rootScope.main.responseStatusHandler(resp);
                                    $rootScope.showToast('success', 'Saved');
                                    $rootScope.main.redirectToPage('/post/' + resp.thePost.postIndex);
                                })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                })
                        }
                    };
                }
            }
        }
    ]);
angular.module('mainApp')
    .directive('fullPostScope', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.main.goToTop();

                $scope.main = {
                    post: PostService.getCurrentPost($rootScope.$stateParams.postIndex),
                    postIsLoaded: false,
                    isLoading: true,
                    startLoading: function () {
                        this.isLoading = true;
                    },
                    finishLoading: function () {
                        this.isLoading = false;
                    }
                };

                function getFullPost() {
                    $scope.main.startLoading();
                    PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            if (Object.keys(resp.thePost).length > 0) {
                                $scope.main.post = PostService.updatePost(resp.thePost);

                                //check first that this is a production env --> showDisqus before bootstrapping disqus
                                if ($scope.showDisqus) {
                                    $scope.main.postIsLoaded = true;
                                }
                            } else {
                                //empty the post
                                $scope.main.post = PostService.updatePost({});
                            }
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.post = PostService.updatePost({});
                        });
                    $scope.main.finishLoading();
                }

                getFullPost();

                //===============socket listeners===============

                $rootScope.$on('postUpdate', function (event, data) {
                    if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                        PostService.updatePost(data.post);
                    }
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }])
    .directive('fullPost', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/all/partials/views/home/full_post.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //full_post.html depends on fullPostScope
            }
        }
    }]);
angular.module('mainApp')
    .directive('newPostDirectiveScope', ['$filter', '$rootScope', 'PostService', 'globals', function ($filter, $rootScope, PostService, globals) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $rootScope.main.goToTop();

                $scope.newPostModel = {
                    postHeading: "",
                    postContent: "",
                    postSummary: "",
                    postTags: [],
                    postUploads: []
                };

                //broadcast here helps distinguish from the inform checking and the checking on submit, which requires notifications
                //broadcast takes a boolean value
                $scope.validateForm = function (notify) {
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
                        if (!$filter("validatePostTags")($scope.newPostModel.postTags, notify)) {
                            errors++;
                        }
                    }
                    return errors == 0;
                };

                $scope.submitNewPost = function () {
                    if ($scope.validateForm(true) && globals.checkAccountStatus()) {
                        var newPost = {
                            postHeading: $scope.newPostModel.postHeading,
                            postContent: $scope.newPostModel.postContent,
                            postSummary: $scope.newPostModel.postSummary,
                            postTags: $scope.newPostModel.postTags,
                            postUploads: $scope.newPostModel.postUploads
                        };

                        PostService.submitNewPost(newPost).
                            success(function (resp) {
                                var thePost = resp.thePost;
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.newPostModel.postHeading = "";
                                $scope.newPostModel.postContent = "";
                                $scope.newPostModel.postSummary = "";
                                $scope.newPostModel.postTags = [];
                                $scope.newPostModel.postUploads = [];
                                $rootScope.main.redirectToPage('/post/' + thePost.postIndex);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $rootScope.main.goToTop();
                            })
                    } else {
                        $rootScope.main.goToTop();
                    }
                }
            }
        }
    }])
    .directive('newPostDirective', ['$filter', '$rootScope', 'PostService', 'globals', function ($filter, $rootScope, PostService, globals) {
        return {
            templateUrl: 'views/all/partials/views/home/new_post.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //new_post depends on newPostDirectiveScope
            }
        }
    }]);
angular.module('mainApp')
    .directive('postStreamPager', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {

            templateUrl: 'views/all/partials/templates/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $scope.$watch(PostService.getAllPostsCount, function (newValue, oldValue) {
                    $scope.pagingTotalCount = newValue;
                });

                $scope.currentPage = $rootScope.$stateParams.pageNumber;

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //refresh the currentPage if the user is going to a new state
                    if (fromState.name != toState.name) {
                        if ($rootScope.$state.current.name != 'home') {
                            $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        }
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    if ($rootScope.$state.current.name == 'home') {
                        $rootScope.$state.go('home.stream', {pageNumber: $scope.currentPage});
                    } else {
                        $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage})
                    }
                };
            }
        }
    }])
    .directive('mainSearchResultsPager', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {

            templateUrl: 'views/all/partials/templates/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;

                $scope.$watch(PostService.getMainSearchResultsCount, function (newValue, oldValue) {
                    $scope.pagingTotalCount = newValue;
                });

                $scope.currentPage = $rootScope.$stateParams.pageNumber;

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //refresh the currentPage if the user is going to a new state
                    if (fromState.name != toState.name) {
                        if ($rootScope.$state.current.name != 'home') {
                            $scope.currentPage = $rootScope.$stateParams.pageNumber;
                        }
                    }
                });

                $scope.goToPage = function () {
                    //go to the current state's new page
                    if ($rootScope.$state.current.name == 'home') {
                        $rootScope.$state.go('home.stream', {pageNumber: $scope.currentPage});
                    } else {
                        $rootScope.$state.go($rootScope.$state.current.name, {pageNumber: $scope.currentPage})
                    }
                };
            }
        }
    }]);
angular.module('mainApp')
    .directive('postActionsScope', ['$rootScope', 'PostService', 'globals', function ($rootScope, PostService, globals) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.trashPost = function (postUniqueCuid) {
                    if (postUniqueCuid && globals.checkAccountStatus()) {
                        PostService.trashPost(postUniqueCuid)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                PostService.removePostWithUniqueCuid(postUniqueCuid);
                                $rootScope.back();
                            })
                            .error(function (err) {
                                $rootScope.main.responseStatusHandler(err);
                            })
                    }
                };
            }
        }
    }]);
angular.module('mainApp')
    .directive('headingMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postHeading | postHeadingMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postHeading: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostHeading")($scope.postHeading);
                };
            }
        }
    }])
    .directive('contentMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postContent | postContentMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postContent: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostContent")($scope.postContent);
                }
            }
        }
    }])
    .directive('summaryMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postSummary | postSummaryMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postSummary: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostSummary")($scope.postSummary);
                }
            }
        }
    }])
    .directive('tagMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postTags | postTagsMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postTags: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostTags")($scope.postTags);
                }
            }
        }
    }]);
angular.module('mainApp')
    .directive('postStreamScope', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.theModel2 = JSON.parse($scope.model);
                console.log($scope.theModel2);

                function getPagePosts(pageNumber) {

                    $scope.getModel = {
                        requestedPage: pageNumber
                    };

                    if ($scope.getModel.requestedPage) {
                        $scope.buttonLoading();
                        PostService.getPostsFromServer($scope.getModel)
                            .success(function (resp) {
                                $scope.theModel2.pageNumber++;
                                angular.element('#appendNextPosts').replaceWith(resp);
                                $scope.finishedLoading();
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                                $scope.finishedLoading();
                            });
                    }
                }

                $scope.showMore = function () {
                    getPagePosts(parseInt($scope.theModel2.pageNumber) + 1);
                };

                //button loading state
                $scope.buttonLoading = function () {
                    $('#showMoreBtn2').button('loading');
                };
                $scope.finishedLoading = function () {
                    $('#showMoreBtn2').button('reset');
                };
            }
        }
    }])
    .directive('postStream', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/all/partials/views/home/post_stream.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //post_stream depends on postStreamScope
            }
        }
    }]);
angular.module('mainApp')
    .directive('postContent', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postContent = $filter('preparePostContent')($scope.postContent);
            }
        }
    }])
    .directive('postSummary', ['$filter',function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postSummary = $filter('preparePostContent')($scope.postSummary)
            }
        }
    }])
    .directive('postTags', ['$filter',function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('mainApp')
    .directive('postSearchScope', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {

        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.theModel = JSON.parse($scope.model);

                function getPostSearch(pageNumber) {
                    $scope.mainSearchModel = {
                        queryString: $scope.theModel.queryString,
                        requestedPage: pageNumber
                    };


                    if ($scope.mainSearchModel.queryString && $scope.mainSearchModel.requestedPage) {
                        $scope.buttonLoading();
                        PostService.postSearch($scope.mainSearchModel)
                            .success(function (resp) {
                                $scope.theModel.pageNumber++;
                                angular.element('#appendNextPostSearch').replaceWith(resp);
                                $scope.finishedLoading();
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                                $scope.finishedLoading();
                            });
                    }
                }


                $scope.showMore = function () {
                    getPostSearch(parseInt($scope.theModel.pageNumber) + 1);
                };

                //button loading state
                $scope.buttonLoading = function () {
                    $('#showMoreBtn').button('loading');
                };
                $scope.finishedLoading = function () {
                    $('#showMoreBtn').button('reset');
                };
            }
        }
    }]);
angular.module('mainApp')
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
    .directive('contactUs', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            templateUrl: 'views/all/partials/components/contact_us.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.contactUsModel = {
                    name: "",
                    email: "",
                    message: ""
                };

                function validateContactUs(name, email, message) {
                    var errors = 0;

                    if (!name || name.length == 0) {
                        ++errors;
                        $rootScope.showToast('warning', "Please enter your name");
                        return -1
                    } else if (!email || email.length == 0) {
                        ++errors;
                        $rootScope.showToast('warning', "Please enter a valid email");
                        return -1
                    } else if (!message || message.length == 0) {
                        ++errors;
                        $rootScope.showToast('warning', "Message field is empty");
                        return -1;
                    } else if (errors == 0) {
                        return 1;
                    }
                }

                $scope.sendContactUs = function () {
                    var formStatus = validateContactUs($scope.contactUsModel.name, $scope.contactUsModel.email, $scope.contactUsModel.message);
                    if (formStatus == 1) {
                        socketService.sendContactUs($scope.contactUsModel)
                            .success(function (resp) {
                                $scope.contactUsModel.name = "";
                                $scope.contactUsModel.email = "";
                                $scope.contactUsModel.message = "";
                                $rootScope.responseStatusHandler(resp);
                            })
                            .error(function (errResp) {
                                $rootScope.responseStatusHandler(errResp);
                            });
                    }
                };
            }
        }
    }])
    .directive('mainFooter', [function () {
        return {
            templateUrl: 'views/all/partials/components/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('mainApp')
    .directive('suggestedPosts', ['$rootScope', 'PostService', '$timeout', 'globals', function ($rootScope, PostService, $timeout, globals) {
        return {
            templateUrl: 'views/all/partials/templates/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.main.goToTop();
                $scope.suggestedPosts = PostService.getSuggestedPosts();

                function getSuggestedPosts() {
                    PostService.getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if ((resp.postsArray.length > 0)) {
                                $scope.suggestedPosts = PostService.updateSuggestedPosts(resp.postsArray);
                            } else {
                                $scope.suggestedPosts = PostService.getSuggestedPosts();
                            }

                        })
                        .error(function (errResp) {
                            $scope.suggestedPosts = PostService.getSuggestedPosts();
                            $rootScope.main.responseStatusHandler(errResp);
                        });
                }

                getSuggestedPosts();
            }
        }
    }]);
angular.module('mainApp')
    .directive('trashPostDir', ['$rootScope', 'PostService', 'globals', function ($rootScope, PostService, globals) {
        return {
            template: ' <a class="btn-link btn btn-default btn-sm" href ng-click="trashPost(post.postUniqueCuid)">Delete</a>',
            restrict: 'AE',
            scope: {
                post: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.trashPost = function (postUniqueCuid) {
                    if (postUniqueCuid && globals.checkAccountStatus()) {
                        PostService.trashPost(postUniqueCuid)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                PostService.removePostWithUniqueCuid(postUniqueCuid);
                                $rootScope.back();
                            })
                            .error(function (err) {
                                $rootScope.main.responseStatusHandler(err);
                            })
                    }
                }
            }
        }
    }]);
angular.module('mainApp')
    .directive('universalBannerScope', ['$rootScope', 'globals', function ($rootScope, globals) {
        return {
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
    }]);
angular.module('mainApp')
    .directive('universalSearchBoxScope', ['$window', '$location', '$rootScope', 'globals', function ($window, $location, $rootScope, globals) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.mainSearchModel = {
                    queryString: "",
                    requestedPage: 1
                };

                $scope.performMainSearch = function () {
                    if ($scope.mainSearchModel.queryString.length > 0) {
                        $rootScope.main.redirectToPage('/search/posts/' + $scope.mainSearchModel.queryString + '/' + $scope.mainSearchModel.requestedPage);
                    }
                };
            }
        }
    }]);
angular.module('mainApp')
    .directive('newPostUploader', ['$rootScope', 'uploadService', 'globals', function ($rootScope, uploadService, globals) {
        return {

            templateUrl: 'views/all/partials/templates/new_post_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
                $scope.uploading = {
                    show: false,
                    percent: 0
                };

                $scope.showUploading = function () {
                    $scope.isUploading = true;
                    $scope.uploading.percent = 0;
                    $scope.uploading.show = true;
                };

                $scope.hideProgressBars = function () {
                    $scope.isUploading = false;
                    $scope.uploading.show = false;
                };

                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.newPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadPdf(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPdf(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.newPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadZip(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadZip(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.newPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }
            }
        }
    }])
    .directive('editPostUploader', ['$rootScope', 'uploadService', 'globals', function ($rootScope, uploadService, globals) {
        return {

            templateUrl: 'views/all/partials/templates/edit_post_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
                $scope.uploading = {
                    show: false,
                    percent: 0
                };

                $scope.showUploading = function () {
                    $scope.isUploading = true;
                    $scope.uploading.percent = 0;
                    $scope.uploading.show = true;
                };

                $scope.hideProgressBars = function () {
                    $scope.isUploading = false;
                    $scope.uploading.show = false;
                };

                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.editPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadPdf(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPdf(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.editPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadZip(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadZip(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.editPostModel.postUploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }
            }
        }
    }])
    .directive('uploaderDirective', ['$rootScope', 'uploadService', 'globals', function ($rootScope, uploadService, globals) {
        return {

            templateUrl: 'views/all/partials/templates/simple_uploader.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
                $scope.uploads = [];
                $scope.uploading = {
                    show: false,
                    percent: 0
                };

                $scope.showUploading = function () {
                    $scope.isUploading = true;
                    $scope.uploading.percent = 0;
                    $scope.uploading.show = true;
                };

                $scope.hideProgressBars = function () {
                    $scope.isUploading = false;
                    $scope.uploading.show = false;
                };

                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPostImage(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadPdf(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadPdf(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }

                function uploadZip(fields, file) {
                    if (globals.checkAccountStatus()) {
                        uploadService.uploadZip(fields, file)
                            .progress(function (evt) {
                                $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                            })
                            .success(function (data, status, headers, config) {
                                $rootScope.main.responseStatusHandler(data);
                                $scope.uploads.push(data.fileData);
                                $scope.hideProgressBars();
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                                $scope.hideProgressBars();
                            });
                    }
                }
            }
        }
    }]);
angular.module('mainApp')
    .directive('adminUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/admin_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.adminUsersModel = {
                    filterString: ""
                };
                $scope.adminUsers = UserService.getAdminUsers();

                function getAdminUsers() {
                    if (globals.checkAccountStatus()) {
                        UserService.getAdminUsersFromServer()
                            .success(function (resp) {
                                $scope.adminUsers = UserService.updateAdminUsers(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                }

                getAdminUsers();

                $rootScope.$on('userChanges', function () {
                    getAdminUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('mainApp')
    .directive('allUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/all_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.allUsersModel = {
                    filterString: ""
                };

                $scope.allUsers = UserService.getAllUsers();

                function getAllUsers() {
                    if (globals.checkAccountStatus()) {
                        UserService.getAllUsersFromServer()
                            .success(function (resp) {
                                $scope.allUsers = UserService.updateAllUsers(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                }

                getAllUsers();

                $rootScope.$on('userChanges', function () {
                    getAllUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('mainApp')
    .directive('bannedUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/banned_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.bannedUsersModel = {
                    filterString: ""
                };

                $scope.bannedUsers = UserService.getBannedUsers();

                function getBannedUsers() {
                    if (globals.checkAccountStatus()) {
                        UserService.getBannedUsersFromServer()
                            .success(function (resp) {
                                $scope.bannedUsers = UserService.updateBannedUsers(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                }

                getBannedUsers();

                $rootScope.$on('userChanges', function () {
                    getBannedUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('mainApp')
    .directive('unApprovedUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/unApproved_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.usersNotApprovedModel = {
                    filterString: ""
                };
                $scope.usersNotApproved = UserService.getUsersNotApproved();

                function getUsersNotApproved() {
                    if (globals.checkAccountStatus()) {
                        UserService.getUsersNotApprovedFromServer()
                            .success(function (resp) {
                                $scope.usersNotApproved = UserService.updateUsersNotApproved(resp.usersArray);
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                }

                getUsersNotApproved();

                $rootScope.$on('userChanges', function () {
                    getUsersNotApproved();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('mainApp')
    .directive('userDisplay', ['$rootScope', 'UserService', 'socketService', 'globals', function ($rootScope, UserService, socketService, globals) {
        return {
            templateUrl: 'views/all/partials/templates/user_display.html',
            restrict: 'AE',
            scope: {
                user: '='
            },
            link: function ($scope, $element, $attrs) {
                //$scope.user included in scope

                $scope.isCollapsed = true;

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    socketService.resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                        })
                };

                //user manipulation functions
                $scope.addAdminPrivileges = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.addAdminPrivileges(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.removeAdminPrivileges = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.removeAdminPrivileges(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.approveUser = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.approveUser(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.banUser = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.banUser(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };

                $scope.unBanUser = function (userUniqueCuid) {
                    if (globals.checkAccountStatus()) {
                        UserService.unBanUser(userUniqueCuid)
                            .success(function (resp) {
                                $rootScope.$broadcast('userChanges');
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };
            }
        }
    }]);
angular.module('mainApp')
    .directive('usersCount', ['$q', '$log', '$rootScope', 'globals', function ($q, $log, $rootScope, globals) {
        return {
            templateUrl: 'views/all/partials/templates/user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);