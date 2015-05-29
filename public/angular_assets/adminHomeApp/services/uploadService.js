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
                },

                uploadPdf: function (fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadPdf',
                        fields: fields,
                        file: file
                    });
                },

                uploadZip: function (fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadZip',
                        fields: fields,
                        file: file
                    });
                }
            }
        }]);