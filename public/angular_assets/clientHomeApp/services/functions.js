angular.module('clientHomeApp')
    .factory('fN', [function () {
        return {
            calcObjectLength: function (obj) {
                var len = 0;
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        len++;
                    }
                }
                return len
            }
        };
    }]);