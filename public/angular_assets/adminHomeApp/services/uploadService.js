angular.module('adminHomeApp')
    .factory('uploadService', ['$q', '$location', 'Upload', 'globals',
        function ($q, $location, Upload, globals) {
            return {
                uploadPostImage: function (fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadPostImage',
                        fields: fields,
                        file: file
                    });
                }
            }
        }]);