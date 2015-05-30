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
    'ui.utils',
    'ngFileUpload'
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
            .state('home.newPost', {
                url: '/newPost',
                templateUrl: 'views/admin/partials/views/new_post.html'
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
angular.module('adminHomeApp')
    .controller('HotController', ['$q', '$log', '$scope', '$rootScope', 'HotService',
        function ($q, $log, $scope, $rootScope, HotService) {

            $scope.hotThisWeek = HotService.getHotThisWeek();

            function getHotThisWeek() {
                HotService.getHotThisWeekFromServer()
                    .success(function (resp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek(resp.hotThisWeek);
                    })
                    .error(function (errResp) {
                        $scope.hotThisWeek = HotService.updateHotThisWeek([]);
                        $rootScope.main.responseStatusHandler(errResp);
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

                clientIsRegistered: false,

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
                        $rootScope.main.clientIsRegistered = $scope.userData.isRegistered;

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
angular.module('adminHomeApp')
    .controller('EditPostController', ['$q', '$filter', '$log', '$window', '$location', '$scope', '$rootScope', 'globals', 'PostService', 'fN',
        function ($q, $filter, $log, $window, $location, $scope, $rootScope, globals, PostService, fN) {

            $rootScope.main.goToTop();

            $scope.editPostModel = PostService.getCurrentEditPostModel();

            function getFullEditPostModel() {
                PostService.getCurrentEditPostModelFromServer($rootScope.$stateParams.postIndex)
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
                        if (fN.calcObjectLength(resp.thePost) != 0) {
                            $scope.editPostModel = PostService.updateCurrentEditPostModel(resp.thePost);
                            globals.changeDocumentTitle($scope.editPostModel.postHeading);
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
                if ($scope.validateEditForm(true)) {
                    PostService.submitPostUpdate($scope.editPostModel)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            $rootScope.showToast('success', 'Saved');
                            if ($location.port()) {
                                $window.location.href = "http://" + $location.host() + ":" + $location.port() + $scope.editPostModel.postPath;
                            } else {
                                $window.location.href = "http://" + $location.host() + $scope.editPostModel.postPath
                            }
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
            };
        }
    ]);
angular.module('adminHomeApp')
    .controller('SearchController', ['$q', '$log', '$scope', '$rootScope', 'globals', 'PostService',
        function ($q, $log, $scope, $rootScope, globals, PostService) {

            $rootScope.main.goToTop();

            $scope.mainSearchModel = {
                queryString: $rootScope.$stateParams.queryString || '',
                postSearchUniqueCuid: "",
                requestedPage: 1
            };

            //change to default document title
            globals.changeDocumentTitle($rootScope.$stateParams.queryString + " - NegusMath Search");

            $scope.mainSearchResultsPosts = PostService.getAllMainSearchResults();
            $scope.mainSearchResultsCount = 0;

            function getMainSearchResults(pageNumber) {
                $scope.mainSearchModel = {
                    queryString: $rootScope.$stateParams.queryString || '',
                    postSearchUniqueCuid: $scope.mainSearchModel.postSearchUniqueCuid,
                    requestedPage: pageNumber
                };

                PostService.mainSearch($scope.mainSearchModel)
                    .success(function (resp) {
                        //the response is the resultValue
                        if (resp.results.totalResults > 0) {
                            var theResult = resp.results;
                            $scope.mainSearchResultsPosts[pageNumber] = PostService.updateMainSearchResults(theResult.postsArray, pageNumber);
                            $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(theResult.totalResults);
                            $scope.mainSearchModel.postSearchUniqueCuid = theResult.searchUniqueCuid;

                            var responseMimic1 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned " + $scope.mainSearchResultsCount + " results"
                            };
                            $rootScope.main.responseStatusHandler(responseMimic1);
                        } else {
                            //empty the postsArray
                            $scope.mainSearchResultsPosts[pageNumber] = PostService.updateMainSearchResults([]);
                            $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(0);
                            var responseMimic2 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned 0 results"
                            };
                            $rootScope.main.responseStatusHandler(responseMimic2);
                        }
                    })
                    .error(function (errResp) {
                        $rootScope.main.responseStatusHandler(errResp);
                        //empty the postsArray
                        $scope.mainSearchResultsPosts[pageNumber] = PostService.updateMainSearchResults([]);
                        $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(0);
                    });
            }

            getMainSearchResults(1);

            $scope.showMore = function (pageNumber) {
                getMainSearchResults(pageNumber);
            };

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                if ($rootScope.$state.current.name == 'home.search') {
                    getMainSearchResults();
                }
            });
        }
    ]);
angular.module('adminHomeApp')
    .controller('UserManagerController', ['$q', '$scope', '$rootScope', 'UserService',
        function ($q, $scope, $rootScope, UserService) {

            $rootScope.main.goToTop();

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                UserService.getUsersCountFromServer()
                    .success(function (resp) {
                        $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                        $rootScope.main.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    })
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
                return makeResp(post)
            } else if (posts) {
                posts.forEach(function (post, index) {
                    posts[index] = makeResp(post);
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
angular.module('adminHomeApp')
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
angular.module('adminHomeApp')

    .factory('fN', [function () {
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

    .factory('globals', ['$q', '$location',
        function ($q, $location) {
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
                    if ($location.port()) {
                        return "http://" + $location.host() + ":" + $location.port();
                    } else {
                        return "http://" + $location.host();
                    }
                }
            };
        }]);
angular.module('adminHomeApp')
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
                        hotThisWeek = $filter('preparePostsNoChange')(null, hotThisWeekArray);
                    }
                    return hotThisWeekArray;
                }
            };
        }]);
angular.module('adminHomeApp')
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
        }]);
angular.module('adminHomeApp')
    .factory('PostService', ['$filter', '$http', '$window', '$rootScope', 'socket',
        function ($filter, $http, $window, $rootScope, socket) {

            var post = {};
            var editPostModel = {};
            var allPosts = {};
            var allPostsCount = 0;
            var mainSearchResultsPosts = {};
            var mainSearchResultsPostsCount = 0;
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

                getPostsFromServer: function (pageNumber) {
                    return $http.post('/api/getPosts', {
                        page: pageNumber
                    })
                },

                updatePosts: function (postsArray, pageNumber) {
                    if (postsArray == []) {
                        allPosts[pageNumber] = [];
                    } else {
                        allPosts[pageNumber] = $filter('preparePosts')(null, postsArray);
                    }
                    return allPosts[pageNumber];
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

                getAllMainSearchResults: function () {
                    return mainSearchResultsPosts;
                },

                getMainSearchResultsCount: function (pageNumber) {
                    return mainSearchResultsPostsCount[pageNumber];
                },

                mainSearch: function (searchObject) {
                    return $http.post('/api/mainSearch', searchObject);
                },

                updateMainSearchResults: function (resultsArray, pageNumber) {
                    if (resultsArray == []) {
                        mainSearchResultsPosts[pageNumber] = [];
                    } else {
                        mainSearchResultsPosts[pageNumber] = $filter('preparePosts')(null, resultsArray);
                    }
                    return mainSearchResultsPosts[pageNumber];
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
        function ($log, $http) {

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
        }]);
angular.module('adminHomeApp')
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
        }]);
angular.module('adminHomeApp')
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
        }]);
angular.module('adminHomeApp')
    .directive('accountStatusBanner', ['$rootScope', 'socketService', '$location', '$window', function ($rootScope, socketService, $location, $window) {
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

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    socketService.resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                        })
                };


                //initial requests
                function getAccountDetails() {
                    socketService.getUserData()
                        .success(function (resp) {
                            $scope.theUser = resp.userData;
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
                        if (userData.isRegistered && userData.emailIsConfirmed && userData.isApproved && !userData.isBanned.status) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                };

                function determineAccountStatus(userData) {
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
            templateUrl: 'views/admin/partials/smalls/loading_banner.html',
            restrict: 'AE',
            controller: controller
        }
    }]);
angular.module('adminHomeApp')
    .directive('fullPost', ['$q', '$log', '$rootScope', 'globals', 'PostService', 'fN', function ($q, $log, $rootScope, globals, PostService, fN) {
        return {
            templateUrl: 'views/admin/partials/smalls/post_full.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.post = PostService.getCurrentPost($rootScope.$stateParams.postIndex);
                $rootScope.main.goToTop();

                $scope.postIsLoaded = false;

                function getFullPost() {
                    PostService.getPostFromServer($rootScope.$stateParams.postIndex)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            if (fN.calcObjectLength(resp.thePost) != 0) {
                                $scope.post = PostService.updatePost(resp.thePost);
                                globals.changeDocumentTitle($scope.post.postHeading);

                                //check first that this is a production env --> showDisqus before bootstrapping disqus
                                if ($scope.showDisqus) {
                                    $scope.postIsLoaded = true;
                                }
                            } else {
                                //empty the post
                                $scope.post = PostService.updatePost({});
                            }

                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.post = PostService.updatePost({});
                        });
                }

                getFullPost();

                //===============socket listeners===============

                $rootScope.$on('postUpdate', function (event, data) {
                    if ($rootScope.$stateParams.postIndex == data.post.postIndex) {
                        PostService.updatePost(data.post);
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
        }
    }]);
angular.module('adminHomeApp')
    .directive('newPostDirective', ['$filter', '$rootScope', 'PostService', function ($filter, $rootScope, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/new_post_full.html',
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
                        if (!$filter("validatePostTags")($scope.newPostModel.postTags, notify)) {
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
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.newPostModel.postHeading = "";
                                $scope.newPostModel.postContent = "";
                                $scope.newPostModel.postSummary = "";
                                $scope.newPostModel.postTags = [];
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
    }]);
angular.module('adminHomeApp')
    .directive('postStreamPager', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {

            templateUrl: 'views/general/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $scope.$watch(PostService.getCurrentPostsCount, function (newValue, oldValue) {
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

            templateUrl: 'views/general/smalls/pager.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.pagingMaxSize = 5;
                $scope.numPages = 5;
                $scope.itemsPerPage = 10;
                $scope.pagingTotalCount = 1;
                $scope.$watch(PostService.getCurrentMainSearchResultsCount, function (newValue, oldValue) {
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
angular.module('adminHomeApp')
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
angular.module('adminHomeApp')
    .directive('postStream', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/general/smalls/post_feed.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                globals.defaultDocumentTitle();

                $scope.allPosts = PostService.getAllPosts();
                $rootScope.main.goToTop();
                $scope.allPostsCount = PostService.getAllPostsCount();

                function getPagePosts(pageNumber) {
                    //check if we have the posts cached, if so return them
                    if ($scope.allPosts.hasOwnProperty(pageNumber)) {
                        if ($scope.allPosts[pageNumber].length > 0) {
                        } else {
                            getFromServer(pageNumber);
                        }
                    } else {
                        getFromServer(pageNumber);
                    }

                    function getFromServer(pageNumber) {
                        PostService.getPostsFromServer(pageNumber)
                            .success(function (resp) {
                                //this function  creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
                                //used if the user is accessing a page that is beyond the number of posts
                                if (resp.postsArray.length > 0) {
                                    $scope.allPosts[pageNumber] = PostService.updatePosts(resp.postsArray, pageNumber);
                                    if (resp.postsCount) {
                                        $scope.allPostsCount = PostService.updateAllPostsCount(resp.postsCount);
                                    }
                                } else {
                                    //empty the postsArray
                                    $scope.allPosts[pageNumber] = PostService.updatePosts([]);

                                    //var responseMimic = {
                                    //    banner: true,
                                    //    bannerClass: 'alert alert-dismissible alert-success',
                                    //    msg: "No more posts to show"
                                    //};
                                    //$rootScope.main.responseStatusHandler(responseMimic);
                                }
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                                $scope.allPosts[pageNumber] = PostService.updatePosts([]);
                            });
                    }
                }

                $scope.showMore = function (pageNumber) {
                    getPagePosts(pageNumber);
                };
                getPagePosts(1);

                //===============socket listeners===============

                $rootScope.$on('newPost', function (event, data) {
                    PostService.addNewToPosts(data.post);
                    if (data.postsCount) {
                        $scope.allPostsCount = PostService.updatePostsCount(data.postsCount);
                    }
                });

                $rootScope.$on('reconnect', function () {
                    if ($rootScope.$state.current.name == 'home' || $rootScope.$state.current.name == 'home.stream') {
                        //getPagePosts();
                    }
                });
            }
        }
    }]);
angular.module('adminHomeApp')
    .directive('postContent', [function () {
        return {
            templateUrl: 'views/admin/partials/smalls/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postSummary', [function () {
        return {
            templateUrl: 'views/admin/partials/smalls/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('postTags', [function () {
        return {
            templateUrl: 'views/admin/partials/smalls/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
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
    .directive('topNav', ['$rootScope', 'logoutService', function ($rootScope, logoutService) {
        return {

            templateUrl: 'views/admin/partials/views/top_nav.html',
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
    }])
    .directive('contactUs', ['$rootScope', 'socketService', function ($rootScope, socketService) {
        return {
            templateUrl: 'views/general/smalls/contact_us.html',
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
            templateUrl: 'views/general/smalls/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('adminHomeApp')
    .directive('suggestedPosts', ['$rootScope', 'PostService', function ($rootScope, PostService) {
        return {
            templateUrl: 'views/admin/partials/smalls/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.suggestedPosts = PostService.getSuggestedPosts();
                $rootScope.main.goToTop();

                function getSuggestedPosts() {
                    PostService.getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if ((resp.postsArray.length > 0)) {
                                $scope.suggestedPosts = PostService.updateSuggestedPosts(resp.postsArray);
                            } else {
                                //empty the suggestedPosts
                                $scope.suggestedPosts = [];
                            }

                        })
                        .error(function (errResp) {
                            //empty the suggestedPosts
                            $scope.suggestedPosts = PostService.updateSuggestedPosts([]);
                            $rootScope.main.responseStatusHandler(errResp);
                        });
                }

                getSuggestedPosts();
            }
        }
    }]);
angular.module('adminHomeApp')
    .directive('universalSearchBox', ['$window', '$location', '$rootScope', function ($window, $location, $rootScope) {
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
    }]);
angular.module('adminHomeApp')
    .directive('newPostUploader', ['$rootScope', 'uploadService', function ($rootScope, uploadService) {
        return {

            templateUrl: 'views/general/smalls/new_post_uploader.html',
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

                function uploadPdf(fields, file) {
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

                function uploadZip(fields, file) {
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
    }])
    .directive('uploaderDirective', ['$rootScope', 'uploadService', function ($rootScope, uploadService) {
        return {

            templateUrl: 'views/general/smalls/simple_uploader.html',
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

                function uploadPdf(fields, file) {
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

                function uploadZip(fields, file) {
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
    }]);
angular.module('adminHomeApp')
    .directive('adminUsers', ['$q', '$log', '$rootScope', 'UserService', function ($q, $log, $rootScope, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/admin_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.adminUsersModel = {
                    filterString: ""
                };
                $scope.adminUsers = UserService.getAdminUsers();

                function getAdminUsers() {
                    UserService.getAdminUsersFromServer()
                        .success(function (resp) {
                            $scope.adminUsers = UserService.updateAdminUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
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
angular.module('adminHomeApp')
    .directive('allUsers', ['$q', '$log', '$rootScope', 'UserService', function ($q, $log, $rootScope, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/all_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.allUsersModel = {
                    filterString: ""
                };

                $scope.allUsers = UserService.getAllUsers();

                function getAllUsers() {
                    UserService.getAllUsersFromServer()
                        .success(function (resp) {
                            $scope.allUsers = UserService.updateAllUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
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
angular.module('adminHomeApp')
    .directive('bannedUsers', ['$q', '$log', '$rootScope', 'UserService', function ($q, $log, $rootScope, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/banned_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.bannedUsersModel = {
                    filterString: ""
                };

                $scope.bannedUsers = UserService.getBannedUsers();

                function getBannedUsers() {
                    UserService.getBannedUsersFromServer()
                        .success(function (resp) {
                            $scope.bannedUsers = UserService.updateBannedUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
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
angular.module('adminHomeApp')
    .directive('unApprovedUsers', ['$q', '$log', '$rootScope', 'UserService', function ($q, $log, $rootScope, UserService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/unApproved_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.usersNotApprovedModel = {
                    filterString: ""
                };
                $scope.usersNotApproved = UserService.getUsersNotApproved();

                function getUsersNotApproved() {
                    UserService.getUsersNotApprovedFromServer()
                        .success(function (resp) {
                            $scope.usersNotApproved = UserService.updateUsersNotApproved(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
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
angular.module('adminHomeApp')
    .directive('userDisplay', ['$rootScope', 'UserService', 'socketService', function ($rootScope, UserService, socketService) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/user_display.html',
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
                    UserService.addAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };

                $scope.removeAdminPrivileges = function (userUniqueCuid) {
                    UserService.removeAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };

                $scope.approveUser = function (userUniqueCuid) {
                    UserService.approveUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };

                $scope.banUser = function (userUniqueCuid) {
                    UserService.banUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };

                $scope.unBanUser = function (userUniqueCuid) {
                    UserService.unBanUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
            }
        }
    }]);
angular.module('adminHomeApp')
    .directive('usersCount', ['$q', '$log', '$rootScope', function ($q, $log, $rootScope) {
        return {
            templateUrl: 'views/admin/partials/smalls/users/user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);