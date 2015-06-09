angular.module('app')
    .directive('postStreamScope', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.theModel2 = JSON.parse($scope.model);

                function getPagePosts(pageNumber) {

                    $scope.getModel = {
                        requestedPage: pageNumber
                    };

                    if ($scope.getModel.requestedPage) {
                        $scope.buttonLoading();
                        PostService.getPostsFromServer($scope.getModel)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.theModel2.pageNumber++;
                                angular.element('#appendNextPosts').replaceWith(resp);
                                $scope.finishedLoading();
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                                $scope.finishedLoading();
                            });
                    }
                }

                $scope.showMore = function () {
                    getPagePosts(parseInt($scope.theModel2.pageNumber) + 1);
                };

                //button loading state
                $scope.buttonLoading = function () {
                    $('#showMoreBtn2').button('loading');
                };
                $scope.finishedLoading = function () {
                    $('#showMoreBtn2').button('reset');
                };
            }
        }
    }])
    .directive('postStream', ['$q', '$log', '$rootScope', 'globals', 'PostService', function ($q, $log, $rootScope, globals, PostService) {
        return {
            templateUrl: 'views/all/partials/views/home/post_stream.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //post_stream depends on postStreamScope
            }
        }
    }]);