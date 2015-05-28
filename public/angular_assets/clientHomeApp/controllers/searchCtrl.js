angular.module('clientHomeApp')
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