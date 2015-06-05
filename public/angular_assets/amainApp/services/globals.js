angular.module('mainApp')

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
                    if ($location.port()) {
                        return "http://" + $location.host() + ":" + $location.port();
                    } else {
                        return "http://" + $location.host();
                    }
                },

                checkAccountStatus: function () {
                    function getStatus(userData) {
                        if (userData && Object.keys(userData)) {
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
        }]);