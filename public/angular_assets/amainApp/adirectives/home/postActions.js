angular.module('app')
    .directive('postActionsScope', ['$rootScope', 'PostService', 'globals', 'ngDialog', function ($rootScope, PostService, globals, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.trashPost = function (postUniqueCuid) {
                    if (postUniqueCuid && globals.checkAccountStatus()) {
                        ngDialog.openConfirm({
                            template: '/views/dialogs/confirm-trash-post.html',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: false,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function () {
                            continueTrashing(postUniqueCuid);
                        }, function () {
                            $scope.main.showToast('success', 'Deletion cancelled')
                        });

                        function continueTrashing() {
                            PostService.trashPost(postUniqueCuid)
                                .success(function (resp) {
                                    $rootScope.main.responseStatusHandler(resp);
                                    PostService.removePostWithUniqueCuid(postUniqueCuid);
                                    $rootScope.back();
                                })
                                .error(function (err) {
                                    $rootScope.main.responseStatusHandler(err);
                                })
                        }
                    }
                };
            }
        }
    }]);