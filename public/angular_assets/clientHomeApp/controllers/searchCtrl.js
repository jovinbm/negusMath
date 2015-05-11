angular.module('clientHomeApp')
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