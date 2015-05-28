angular.module('adminHomeApp')
    .controller('SearchController', ['$q', '$log', '$scope', '$rootScope', 'globals', 'PostService',
        function ($q, $log, $scope, $rootScope, globals, PostService) {

            $rootScope.main.goToTop();

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

            function getMainSearchResults() {
                $scope.mainSearchModel = {
                    queryString: $rootScope.$stateParams.queryString || '',
                    postSearchUniqueCuid: $scope.mainSearchModel.postSearchUniqueCuid,
                    requestedPage: $rootScope.$stateParams.pageNumber || 1
                };

                PostService.mainSearch($scope.mainSearchModel)
                    .success(function (resp) {
                        //the response is the resultValue
                        if (resp.results.totalResults > 0) {
                            var theResult = resp.results;
                            $scope.mainSearchResultsPosts = PostService.updateMainSearchResults(theResult.postsArray);
                            $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(theResult.totalResults);
                            $scope.changeCurrentPage(theResult.page);
                            $scope.mainSearchModel.postSearchUniqueCuid = theResult.searchUniqueCuid;

                            var responseMimic1 = {
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-success',
                                msg: "The search returned " + $scope.mainSearchResultsCount + " results"
                            };
                            $rootScope.main.responseStatusHandler(responseMimic1);
                        } else {
                            //empty the postsArray
                            $scope.mainSearchResultsPosts = PostService.updateMainSearchResults([]);
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
                        $scope.mainSearchResultsPosts = PostService.updateMainSearchResults([]);
                        $scope.mainSearchResultsCount = PostService.updateMainSearchResultsCount(0);
                    });
            }

            getMainSearchResults();

            //this functions evaluates to true if object is not empty, useful for ng-show
            //this function also creates a banner to notify user that there are no posts by mimicking a response and calling the response handler
            $scope.checkIfPostsSearchResultsIsEmpty = function () {
                return $scope.mainSearchResultsPosts.length == 0
            };

            //===============socket listeners===============

            $rootScope.$on('reconnect', function () {
                if ($rootScope.$state.current.name == 'home.search') {
                    getMainSearchResults();
                }
            });
        }
    ]);