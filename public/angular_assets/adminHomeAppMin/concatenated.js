angular.module('adminHomeApp', [
    'ui.bootstrap',
    'angular-loading-bar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngAnimate',
    'textAngular',
    'ngSanitize',
    'angularUtils.directives.dirDisqus'
])
    .run(function ($templateCache, $http) {
        //views
        $http.get('views/admin/partials/views/post_stream.html', {cache: $templateCache});
        $http.get('views/admin/partials/views/full_post.html', {cache: $templateCache});
    })

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise("/home/1");

        $stateProvider
            .state('home', {
                url: '/home/:pageNumber',
                templateUrl: 'views/admin/partials/views/post_stream.html'
            })
            .state('post', {
                url: '/post/:postIndex',
                templateUrl: 'views/admin/partials/views/full_post.html'
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
    .controller('HotController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams', 'HotService',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams, HotService) {

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

            $log.info('PostController booted successfully');

        }
    ]);
angular.module('adminHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService', 'PostService', '$document', '$state', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService, PostService, $document, $state, $stateParams) {

            //listens for state changes
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

            //clear banners when the state changes
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.clearBanners();
            });

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


            //====================element controllers==========holding states for hidden and visible elements
            //new post
            $scope.newPost = false;
            $scope.showNewPost = function () {
                $scope.newPost = true;
            };
            $scope.hideNewPost = function () {
                $scope.newPost = false;
            };
            //end of new post
            //====================end of element controllers

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

            //===============new post controllers===========
            $scope.newPostModel = {
                postHeading: "",
                postContent: "",
                postSummary: ""
            };

            $scope.submitNewPost = function () {
                if ($scope.newPostModel.postContent.length == 0) {
                    $scope.showToast('warning', 'Please add some content to the post first');
                } else {
                    var newPost = {
                        postHeading: $scope.newPostModel.postHeading,
                        postContent: $scope.newPostModel.postContent,
                        postSummary: $scope.newPostModel.postSummary
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
    .controller('PostsController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {

            $scope.posts = PostService.getCurrentPosts();
            $scope.postsCount = PostService.getCurrentPostsCount();

            function getPagePosts() {
                PostService.getPostsFromServer($stateParams.pageNumber)
                    .success(function (resp) {
                        $scope.posts = PostService.updatePosts(resp.postsArray);
                        updateTimeAgo();
                        $scope.postsCount = resp.postsCount;

                        //this function also creates a banner to notify user that there are no posts by mimicing a response and calling the response handler
                        //used if the user is accessing a page that is beyond the number of posts
                        if ($scope.posts.length == 0) {
                            var responseMimic = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "No more posts to show"
                            };
                            $scope.responseStatusHandler(responseMimic);
                            $scope.goToUniversalBanner();
                        }
                    })
                    .error(function (errResp) {
                        $scope.responseStatusHandler(errResp);
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
                if ($stateParams.pageNumber == 1) {
                    $scope.posts.unshift(data.post);
                    updateTimeAgo();
                }
                $scope.postCount = data.postCount;
            });

            $rootScope.$on('reconnect', function () {
                getPagePosts();
            });

            $log.info('PostController booted successfully');

        }
    ])

    .controller('FullPostController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$stateParams',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $stateParams) {
            $scope.postIndex = $stateParams.postIndex;
            $scope.post = {};
            $scope.postIsLoaded = false;

            //this functions evaluates to true if object is not empty, useful for ng-show
            $scope.checkIfPostIsEmpty = function () {
                return $scope.calcObjectLength($scope.post) == 0
            };

            function getFullPost() {
                PostService.getPostFromServer($scope.postIndex)
                    .success(function (resp) {
                        $scope.post = resp.thePost;
                        $scope.responseStatusHandler(resp);
                        //check that there is a post first before starting disqus and other attributes
                        if ($scope.calcObjectLength($scope.post) != 0) {
                            updateTimeAgo();
                            addPostUrl();
                            $scope.postIsLoaded = true;
                        } else {
                            $scope.goToUniversalBanner();
                        }
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            }

            getFullPost();

            //=============function to update timeago on this post
            function updateTimeAgo() {
                $scope.post.theTimeAgo = $filter('timeago')($scope.post.createdAt);

                //post date/time it was ordered e.g. Sun, Mar 17..
                $scope.post.postDate = moment($scope.post.createdAt).format("ddd, MMM D, H:mm");
            }

            $interval(updateTimeAgo, 120000, 0, true);

            function addPostUrl() {
                $scope.post.postUrl = 'http://' + $location.host() + '/adminHome.html#!/post/' + $scope.post.postIndex;
            }

            //==============end of update time ago

            //=============editing post====================

            //variable that holds the editing or show state in the full-post view.
            $scope.editingMode = false;

            //make copy of post, useful when the user clicks cancel
            $scope.postBackup = $scope.post;

            $scope.goIntoPostEditingMode = function () {
                //make copy of post, useful when the user clicks cancel
                $scope.postBackup = $scope.post;
                $scope.editingMode = true;
            };

            $scope.goIntoFullPostViewMode = function () {
                $scope.editingMode = false;
            };

            $scope.submitPostUpdate = function () {
                if ($scope.post.postContent.length == 0) {
                    $scope.showToast('warning', 'Please add some content to the post first');
                } else {
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
                    getFullPost();
                }
            });

            $log.info('FullPostController booted successfully');

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