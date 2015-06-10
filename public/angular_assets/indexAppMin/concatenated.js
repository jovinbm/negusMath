//angular sanitize included in textAngular
angular.module('app', [
    'ui.bootstrap',
    'cfp.loadingBar',
    'angulartics',
    'angulartics.google.analytics',
    'angularMoment',
    'ui.router',
    'duScroll',
    'ngFx',
    'ngNotificationsBar',
    'textAngular',
    'angularUtils.directives.dirDisqus',
    'ngTagsInput',
    'ui.utils',
    'ngFileUpload',
    'toastr',
    'ngDialog'
]);
angular.module('app')
    .directive('accountOuterScope', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //variable to hold state between local login and creating a new account
                //values =  signIn, register
                $scope.userLoginState = 'signIn';
                $scope.changeUserLoginState = function (newState) {
                    $scope.userLoginState = newState;
                };
            }
        }
    }])
    .directive('accountOuterDialogScope', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //variable to hold state between local login and creating a new account
                //values =  signIn, register
                $scope.userLoginState = 'signIn';
                $scope.changeUserLoginState = function (newState) {
                    $scope.userLoginState = newState;
                };
            }
        }
    }]);
angular.module('app')
    .directive('newPostBanner', ['$rootScope', function ($rootScope) {
        return {
            templateUrl: 'views/all/partials/templates/banners/new_post_banner.html',
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
    .directive('toastrDirective', ['$rootScope', 'toastr', function ($rootScope, toastr) {
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
    .directive('signInBannerScope', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.signInBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('signInBanner', function (event, banner) {
                    $scope.signInBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.signInBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }])
    .directive('registrationBannerScope', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.registrationBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('registrationBanner', function (event, banner) {
                    $scope.registrationBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.registrationBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                })
            }
        }
    }]);
angular.module('app')
    .directive('contactUsScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
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
                        $rootScope.main.showToast('warning', "Please enter your name");
                        return -1
                    } else if (!email || email.length == 0) {
                        ++errors;
                        $rootScope.main.showToast('warning', "Please enter a valid email");
                        return -1
                    } else if (!message || message.length == 0) {
                        ++errors;
                        $rootScope.main.showToast('warning', "Message field is empty");
                        return -1;
                    } else if (errors == 0) {
                        return 1;
                    }
                }

                $scope.sendContactUs = function () {
                    var formStatus = validateContactUs($scope.contactUsModel.name, $scope.contactUsModel.email, $scope.contactUsModel.message);
                    if (formStatus == 1) {
                        sendContactUs($scope.contactUsModel)
                            .success(function (resp) {
                                $scope.contactUsModel.name = "";
                                $scope.contactUsModel.email = "";
                                $scope.contactUsModel.message = "";
                                $rootScope.main.responseStatusHandler(resp);
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                            });
                    }
                };

                function sendContactUs(contactUsModel) {
                    return $http.post('/contactUs', contactUsModel);
                }
            }
        }
    }])
    .directive('contactUs', [function () {
        return {
            templateUrl: 'views/all/partials/components/contact_us.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //depends on contactUsScope
            }
        }
    }]);
angular.module('app')
    .directive('createAccountScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.registrationDetails = {
                    email: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password1: "",
                    password2: "",
                    invitationCode: "",
                    isDialog: false
                };

                $scope.createAccount = function () {
                    createAccount($scope.registrationDetails)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.registrationDetails.password1 = "";
                            $scope.registrationDetails.password2 = "";
                            $scope.registrationDetails.invitationCode = "";
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function createAccount(details) {
                    return $http.post('/createAccount', details);
                }
            }
        }
    }])
    .directive('createAccountDialogScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.registrationDetails = {
                    email: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password1: "",
                    password2: "",
                    invitationCode: "",
                    isDialog: true
                };

                $scope.createAccount = function () {
                    createAccount($scope.registrationDetails)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.registrationDetails.password1 = "";
                            $scope.registrationDetails.password2 = "";
                            $scope.registrationDetails.invitationCode = "";
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function createAccount(details) {
                    return $http.post('/createAccount', details);
                }
            }
        }
    }]);

angular.module('app')
    .directive('mainFooter', [function () {
        return {
            templateUrl: 'views/all/partials/components/main_footer.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('app')
    .directive('logoutScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.logoutClient = function () {
                    logoutClient()
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function logoutClient() {
                    return $http.post('/api/logoutClient');
                }
            }
        }
    }]);
angular.module('app')
    .directive('postContent', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post-components/post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postContent = $filter('preparePostContent')($scope.postContent);
            }
        }
    }])
    .directive('postSummary', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post-components/post_summary.html',
            scope: {
                postSummary: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.postSummary = $filter('preparePostSummary')($scope.postSummary);
            }
        }
    }])
    .directive('postTags', ['$filter', function ($filter) {
        return {
            templateUrl: 'views/all/partials/templates/post-components/post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
            }
        }
    }]);
angular.module('app')
    .directive('resendEmailScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    console.log(userUniqueCuid);
                    resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                        })
                };

                function resendConfirmationEmail(userUniqueCuid) {
                    return $http.post('/resendConfirmationEmail', {
                        userUniqueCuid: userUniqueCuid
                    });
                }
            }
        }
    }]);
angular.module('app')
    .directive('signInScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.loginFormModel = {
                    username: "",
                    password: "",
                    isDialog: false
                };

                $scope.submitLocalLoginForm = function () {
                    localUserLogin($scope.loginFormModel)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function localUserLogin(loginData) {
                    return $http.post('/localUserLogin', loginData);
                }
            }
        }
    }])
    .directive('signInDialogScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.loginFormModel = {
                    username: "",
                    password: "",
                    isDialog: true
                };

                $scope.submitLocalLoginForm = function () {
                    localUserLogin($scope.loginFormModel)
                        .success(function (resp) {
                            //the responseStatusHandler handles all basic response stuff including redirecting the user if a success is picked
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(errResponse);
                        });
                };

                function localUserLogin(loginData) {
                    return $http.post('/localUserLogin', loginData);
                }
            }
        }
    }]);
angular.module('app')
    .directive('suggestedPosts', ['$rootScope', '$filter', '$http', function ($rootScope, $filter, $http) {
        return {
            templateUrl: 'views/all/partials/templates/suggested/suggested_posts.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.suggestedPosts = [];
                $scope.suggestedPostsCount = 0;

                function getSuggestedPosts() {
                    getSuggestedPostsFromServer()
                        .success(function (resp) {
                            if (resp.postsArray.length > 0) {
                                updateSuggestedPosts(resp.postsArray);
                            } else {
                                //do nothing
                            }
                            $rootScope.main.responseStatusHandler(resp);

                        })
                        .error(function (errResp) {
                            $rootScope.main.responseStatusHandler(errResp);
                        });
                }

                getSuggestedPosts();

                function getSuggestedPostsFromServer() {
                    return $http.post('/api/getSuggestedPosts', {})
                }

                function updateSuggestedPosts(suggestedPostsArray) {
                    if (suggestedPostsArray == []) {
                        $scope.suggestedPosts = [];
                    } else {
                        $scope.suggestedPosts = $filter('preparePostsNoChange')(null, suggestedPostsArray);
                    }
                }
            }
        }
    }]);
angular.module('app')
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
    }]);
angular.module('app')
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
                        $rootScope.main.redirectToPage('/search/posts?q=' + $scope.mainSearchModel.queryString + '&page=' + parseInt($scope.mainSearchModel.requestedPage));
                    }
                };
            }
        }
    }]);
angular.module('app')
    .controller('PopularStoriesController', ['$q', '$log', '$scope', '$rootScope', 'PopularStoriesService', 'globals',
        function ($q, $log, $scope, $rootScope, PopularStoriesService, globals) {

            $scope.popularStories = PopularStoriesService.getPopularStories();

            function getPopularStories() {
                PopularStoriesService.getPopularStoriesFromServer()
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
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
angular.module('app')
    .controller('UniversalController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'socketService', 'globals', '$document', 'notifications',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, socketService, globals, $document, notifications) {

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

                showToast: function (type, msg) {
                    $rootScope.showToast(type, msg);
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
                },

                showDialogBox: function (dialogId) {
                    if ($rootScope.showDialog) {
                        $rootScope.showDialog(dialogId);
                    }
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
                        $rootScope.main.responseStatusHandler(resp);
                        $scope.userData = globals.userData(resp.userData);
                        $rootScope.main.broadcastUserData();

                        if ($scope.userData.isRegistered) {
                            //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                            socket.emit('joinRoom', {
                                room: resp.userData.uniqueCuid
                            });
                        }
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
            });

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                initialRequests();
            });
        }
    ]);
angular.module('app')
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
    .filter("preparePostSummary", ['$filter', function ($filter) {
        //making embedded videos responsive in postContent
        return function (postSummary) {

            function prepare(postSummary) {
                return $filter('highlightText')($filter('getVideoResponsiveVersion')(postSummary), true);
            }

            if (postSummary) {
                return prepare(postSummary);
            } else {

                return postSummary;
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
    .filter("responseFilter", ['$q', '$log', '$window', '$rootScope', 'notifications', 'ngDialog', function ($q, $log, $window, $rootScope, notifications, ngDialog) {
        return function (resp) {
            function makeBanner(show, bannerClass, msg) {
                return {
                    show: show ? true : false,
                    bannerClass: bannerClass,
                    msg: msg
                }
            }

            function showNotificationBar(type, msg) {
                switch (type) {
                    case "success":
                        notifications.showSuccess({
                            message: msg
                        });
                        break;
                    case "warning":
                        notifications.showWarning({
                            message: msg
                        });
                        break;
                    case "error":
                        notifications.showError({
                            message: msg
                        });
                        break;
                    default:
                    //toastr.clear();
                }
            }

            if (resp !== null && typeof resp === 'object') {
                if (resp.redirect) {
                    if (resp.redirect) {
                        $window.location.href = resp.redirectPage;
                    }
                }
                if (resp.notify) {
                    if (resp.type && resp.msg) {
                        $rootScope.showToast(resp.type, resp.msg);
                        //showNotificationBar(resp.type, resp.msg);
                    }
                }
                if (resp.dialog) {
                    if (resp.id) {
                        switch (resp.id) {
                            case "not-authorized":
                                not_authorized_dialog();
                                break;
                            case "sign-in":
                                sign_in_dialog();
                                break;
                            default:
                            //do nothing
                        }
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
                if (resp.signInBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('signInBanner', makeBanner(true, resp.bannerClass, resp.msg));
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

            function not_authorized_dialog() {
                ngDialog.open({
                    template: '/dialog/not-authorized.html',
                    className: 'ngdialog-theme-default',
                    overlay: true,
                    showClose: false,
                    closeByEscape: true,
                    closeByDocument: true,
                    cache: false,
                    trapFocus: true,
                    preserveFocus: true
                })
            }

            function sign_in_dialog() {
                ngDialog.openConfirm({
                    template: '/dialog/sign-in.html',
                    className: 'ngdialog-theme-default',
                    overlay: true,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    cache: true,
                    trapFocus: true,
                    preserveFocus: true
                }).then(function () {
                    //do nothing
                }, function () {
                    $rootScope.main.redirectToPage('/index');
                });
            }
        }
    }]);
angular.module('app')

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
angular.module('app')
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
angular.module('app')
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
angular.module('app')
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
angular.module('app')
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

                createAccount: function (details) {
                    return $http.post('/createAccount', details);
                },

                localUserLogin: function (loginData) {
                    return $http.post('/localUserLogin', loginData);
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
angular.module('app')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals) {

            //function that determines if it's okay for the user to proceed
            $scope.checkAccountStatus = function (userData) {
                if (userData) {
                    if (userData.isRegistered) {
                        if (userData.emailIsConfirmed == false) {
                            return false;
                        } else {
                            if (userData.isApproved === false) {
                                return false
                            } else if (userData.isBanned) {
                                if (userData.isBanned.status === true) {
                                    //checking banned status
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

            //variable that holds the account status
            $scope.accountStatusIsGood = false;

            $rootScope.$on('userDataChanges', function () {
                $scope.accountStatusIsGood = $scope.checkAccountStatus(globals.userData);
            });
        }
    ]);