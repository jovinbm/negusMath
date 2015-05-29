var fs = require('fs');
var path = require('path');

var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var forms = require('./forms.js');

var fileName = 'upload_params.js';

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
    postImageParams: function () {
        var module = 'postImageParams';
        receivedLogger(module);
        return {
            dest: './uploads/images/posts',
            rename: function (fieldname, filename) {
                return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
            },
            limits: {
                fieldNameSize: 100,
                files: 1,
                fileSize: 307200 //in bytes, 300kb*1024
            },
            onError: function (err, next) {
                consoleLogger(errorLogger(module, err));
                var error = new Error(module + err);
                error.customStatus = 'upload';
                next(error);
            },
            onFileSizeLimit: function (file) {
                consoleLogger(errorLogger(module, 'file size exceeds limit'));
                fs.unlink('./' + file.path);
            },
            onFilesLimit: function () {
                consoleLogger(errorLogger(module, 'multiple files detected'));
            }
        };
    }
};