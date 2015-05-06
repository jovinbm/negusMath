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

angular.module('searchApp')
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



angular.module('searchApp')
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
angular.module('searchApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'PostService', '$document', '$state', '$stateParams', 'logoutService', 'cfpLoadingBar',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, PostService, $document, $state, $stateParams, logoutService, cfpLoadingBar) {

            //manipulating document title
            $scope.defaultDocumentTitle = function () {
                document.title = "Negus Math - College Level Advanced Mathematics for Kenya Students";
            };

            $scope.changeDocumentTitle = function (newTitle) {
                if (newTitle) {
                    document.title = newTitle;
                }
            };

            //google search box
            $scope.googleSearchModel = {
                searchQuery: ""
            };

            $scope.performGoogleSiteSearch = function () {
                if ($scope.googleSearchModel.searchQuery.length > 0) {
                    if ($location.port()) {
                        $window.location.href = 'http://' + $location.host() + ':' + $location.port() + '/#!/search/?q=' + $scope.googleSearchModel.searchQuery;
                    } else {
                        $window.location.href = 'http://' + $location.host() + '/#!/search/?q=' + $scope.googleSearchModel.searchQuery;
                    }
                }
            };

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
angular.module('searchApp')

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
angular.module('searchApp')
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
angular.module('searchApp')
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
angular.module('searchApp')
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
                }
            };
        }]);
angular.module('searchApp')

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