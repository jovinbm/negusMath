var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var user_handler = require('../handlers/user_handlers.js');
var upload_handlers = require('../handlers/upload_handlers.js');
var userDB = require('../db/user_db.js');
var multer = require('multer');
var middleware = require('../functions/middleware.js');
var forms = require('../functions/forms.js');
var fs = require('fs');
var path = require('path');
var s3 = require('../functions/s3.js');

var fileName = 'upload_api.js';

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
    uploadPostImage: function (req, res) {
        var module = 'uploadPostImage';
        receivedLogger(module);

        var theFile = req.files.file;

        //check that the file was not truncated due to exceeding a specified limit in params
        if (!theFile.truncated) {
            forms.checkFileIsImage(req, res, theFile, callback);
            function callback() {
                consoleLogger(successLogger(module));
                upload_handlers.uploadPostImageToS3(req, res, theFile);
                //res.status(200).send({
                //    fileData: theFile,
                //    uploaded: true,
                //    code: 500,
                //    notify: true,
                //    type: 'success',
                //    msg: 'File successfully uploaded.'
                //});
            }
        } else {
            //file was truncated, nb, file is removed by the params definition
            consoleLogger(errorLogger(module, 'file truncated'));
            res.status(401).send({
                code: 401,
                notify: true,
                type: 'warning',
                msg: 'File should be less than ' + middleware.getHumanReadableFileSize(theFile.size)
            });
        }
    },

    uploadPdf: function (req, res) {
        var module = 'uploadPdf';
        receivedLogger(module);

        var theFile = req.files.file;

        //check that the file was not truncated due to exceeding a specified limit in params
        if (!theFile.truncated) {
            forms.checkFileIsPdf(req, res, theFile, callback);
            function callback() {
                consoleLogger(successLogger(module));
                upload_handlers.uploadPdfToS3(req, res, theFile);
                //res.status(200).send({
                //    fileData: theFile,
                //    uploaded: true,
                //    code: 500,
                //    notify: true,
                //    type: 'success',
                //    msg: 'File successfully uploaded.'
                //});
            }
        } else {
            //file was truncated, nb, file is removed by the params definition
            consoleLogger(errorLogger(module, 'file truncated'));
            res.status(401).send({
                code: 401,
                notify: true,
                type: 'warning',
                msg: 'File should be less than ' + middleware.getHumanReadableFileSize(theFile.size)
            });
        }
    },

    uploadZip: function (req, res) {
        var module = 'uploadZip';
        receivedLogger(module);

        var theFile = req.files.file;

        //check that the file was not truncated due to exceeding a specified limit in params
        if (!theFile.truncated) {
            forms.checkFileIsZip(req, res, theFile, callback);
            function callback() {
                consoleLogger(successLogger(module));
                upload_handlers.uploadZipToS3(req, res, theFile);
                //res.status(200).send({
                //    fileData: theFile,
                //    uploaded: true,
                //    code: 500,
                //    notify: true,
                //    type: 'success',
                //    msg: 'File successfully uploaded.'
                //});
            }
        } else {
            //file was truncated, nb, file is removed by the params definition
            consoleLogger(errorLogger(module, 'file truncated'));
            res.status(401).send({
                code: 401,
                notify: true,
                type: 'warning',
                msg: 'File should be less than ' + middleware.getHumanReadableFileSize(theFile.size)
            });
        }
    }
};
