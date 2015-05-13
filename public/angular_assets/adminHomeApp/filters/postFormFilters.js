angular.module('adminHomeApp')
    .filter("validatePostHeading", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            if (postHeading.length == 0) {
                errors++;
                broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
            }
            if (errors == 0) {
                if (postHeading.length < 10) {
                    broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
                    errors++;
                }
            }
            return errors == 0;
        }
    }])
    .filter("validatePostContent", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postContent, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var postContentText = $("<div>" + postContent + "</div>").text();
            if (postContentText.length == 0) {
                broadcastShowToast('warning', 'Please add some text to the post first')
            }
            return postContentText.length > 0;
        }
    }])
    .filter("postContentMessages", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postContent) {
            var postContentText = $("<div>" + postContent + "</div>").text();
            if (postContentText.length == 0) {
                return "This is a required field. Please add some text"
            } else {
                return "";
            }
        }
    }])
    .filter("validatePostSummary", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postSummary, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var errors = 0;
            var postSummaryText = $("<div>" + postSummary + "</div>").text();

            if (postSummaryText.length == 0) {
                errors++;
                broadcastShowToast('warning', 'The post summary cannot be empty');
            }
            if (errors == 0) {
                if (postSummaryText.length > 2000) {
                    errors++;
                    broadcastShowToast('warning', 'The post summary cannot exceed 2000 characters');
                }
            }
            return errors == 0;
        }
    }])
    .filter("postSummaryMessages", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postSummary) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            var postSummaryText = $("<div>" + postSummary + "</div>").text();

            if (postSummaryText.length == 0) {
                addMessage('The post summary cannot be empty');
            }
            if (postSummaryText.length > 2000) {
                addMessage('The post summary cannot exceed 2000 characters');
            }
            return messages;

        }
    }])
    .filter("validatePostTags", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postTags, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.showToast(type, text);
                }
            }

            var errors = 0;
            var numberOfTags = 0;

            postTags.forEach(function (tag) {
                numberOfTags++;
                if (tag && tag.text) {
                    if (errors == 0) {
                        if (tag.text.length < 3) {
                            errors++;
                            broadcastShowToast('warning', 'Minimum required length for each tag is 3 characters');
                        }
                    }

                    if (errors == 0) {
                        if (tag.text.length > 30) {
                            errors++;
                            broadcastShowToast('warning', 'Maximum allowed length for each tag is 30 characters');
                        }
                    }
                }
            });

            if (errors == 0) {
                if (numberOfTags > 5) {
                    errors++;
                    broadcastShowToast('warning', 'Only a maximum of 5 tags are allowed per post');
                }
            }

            return errors == 0;
        }
    }])
    .filter("postTagsMessages", ['$filter', '$rootScope', function ($filter, $rootScope) {
        return function (postTags) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            var numberOfTags = 0;

            postTags.forEach(function (tag) {
                numberOfTags++;
                if (tag && tag.text) {
                    if (tag.text.length < 3) {
                        addMessage('Minimum required length for each tag is 3 characters');
                    }

                    if (tag.text.length > 30) {
                        addMessage('Maximum allowed length for each tag is 30 characters');
                    }
                }
            });

            if (numberOfTags > 5) {
                addMessage('Only a maximum of 5 tags are allowed per post');
            }

            return messages;
        }
    }]);