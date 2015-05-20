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
                $scope.showSuggestedPosts = false;
            };

            $scope.showSuggestedPostsOnly = function () {
                $scope.hideLoadingBanner();
                $scope.showMainSearchResults = false;
                $scope.showSuggestedPosts = true;
            };

            //function used to fill in with suggested posts in case no posts are received
            function getSuggestedPosts() {
                $scope.showLoadingBanner();
                //empty the suggestedPosts
                $scope.suggestedPosts = [];
                PostService.getSuggestedPostsFromServer()
                    .success(function (resp) {
                        if ((resp.postsArray.length > 0)) {
                            $scope.showSuggestedPostsOnly();
                            $scope.suggestedPosts = resp.postsArray;
                            $scope.suggestedPosts = $scope.suggestedPosts = $filter('makeVideoIframesResponsive')(null, $scope.suggestedPosts);
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
                        $scope.hideLoadingBanner();
                        //empty the suggestedPosts
                        $scope.suggestedPosts = [];
                        $scope.showSuggestedPosts = false;
                        $rootScope.responseStatusHandler(errResp);
                    });

                //whatever happens, hide the pager
                $scope.hideThePager();
            }

            function getMainSearchResults() {
                $scope.showLoadingBanner();

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
                        $scope.changePagingTotalCount($scope.mainSearchResultsCount);
                        $scope.changeCurrentPage(theResult.page);
                        $scope.mainSearchModel.postSearchUniqueCuid = theResult.searchUniqueCuid;

                        //the response is the resultValue
                        if (theResult.totalResults > 0) {
                            $scope.mainSearchResultsPosts = theResult.postsArray;
                            $scope.mainSearchResultsPosts = $filter('makeVideoIframesResponsive')(null, $scope.mainSearchResultsPosts);
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
                            $scope.mainSearchResultsPosts = [];
                            var responseMimic2 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned 0 results"
                            };
                            $rootScope.responseStatusHandler(responseMimic2);
                            $scope.showMainSearchResults = false;
                            getSuggestedPosts();
                            $scope.goToTop();
                        }
                    })
                    .error(function (errResp) {
                        $rootScope.responseStatusHandler(errResp);
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

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                if ($rootScope.$state.current.name == 'search') {
                    getMainSearchResults();
                }
            });
        }
    ]);