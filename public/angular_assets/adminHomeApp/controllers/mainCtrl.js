angular.module('adminHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService', 'PostService', '$document', '$state', '$stateParams', 'cfpLoadingBar',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService, PostService, $document, $state, $stateParams, cfpLoadingBar) {

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