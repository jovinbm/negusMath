var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var user_handler = require('../handlers/user_handlers.js');
var userDB = require('../db/user_db.js');
var multer = require('multer');
var middleware = require('../functions/middleware.js');
var forms = require('../functions/forms.js');
var fs = require('fs');
var path = require('path');
var s3 = require('../functions/s3.js');

var fileName = 'upload_handlers.js';

var receivedLogger = function (module) {
    var rL = require('../functions/basic.js').receivedLogger;
    rL(fileName, module);
};

var successLogger = function (module, text) {
    var sL = require('../functions/basic.js').successLogger;
    return sL(fileName, module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('../functions/basic.js').errorLogger;
    return eL(fileName, module, text, err);
};

function getTheUser(req) {
    return basic.getTheUser(req);
}

module.exports = {
    uploadPostImageToS3: function (req, res, file) {
        var module = 'uploadPostImageToS3';
        receivedLogger(module);
        var finalFilePath = 'images/post_images/' + file.name;
        s3.uploadPublicFileToBucket('negusmath_assets', finalFilePath, file.path, error_neg_1, success);
        function success(data) {
            consoleLogger(JSON.stringify(data));
            consoleLogger(successLogger(module));
            res.status(200).send({
                fileData: file,
                uploaded: true,
                code: 500,
                notify: true,
                type: 'success',
                msg: 'File successfully uploaded.'
            });

            middleware.deleteFile(file.path, err_del, success_del);

            function success_del() {
                consoleLogger(successLogger(module, 'file successfuly removed from file system'));
            }

            function err_del() {
                consoleLogger(errorLogger(module, "file not removed from file system"));
            }
        }

        function error_neg_1() {
            consoleLogger(errorLogger(module));
            //remove file from filesystem
            middleware.deleteFile(file.path, deleteError, deleteSuccess);

            function deleteSuccess() {
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'warning',
                    msg: 'A problem occurred while uploading your image, please try again.'
                });
            }

            function deleteError() {
                consoleLogger(errorLogger(module, "file not removed from file system"));
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'warning',
                    msg: 'A problem occurred while uploading your image, please try again.'
                });
            }
        }
    }
};