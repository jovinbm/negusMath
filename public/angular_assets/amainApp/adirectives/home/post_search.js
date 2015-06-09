angular.module('app')
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
                                $rootScope.main.responseStatusHandler(resp);
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