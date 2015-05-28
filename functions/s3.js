var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;

var fileName = 's3.js';

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

function ensureBucket(bucketName, error_neg_1, success) {
    var module = 'ensureBucket';
    var s3 = new AWS.S3();
    var params = {
        Bucket: bucketName
    };

    s3.headBucket(params, function (err, data) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            //create the bucket
            s3.createBucket({
                Bucket: bucketName,
                ACL: "public-read-write"
            }, function (err, data) {
                if (err) {
                    consoleLogger(errorLogger(module, err));
                    error_neg_1();
                }
                else {
                    consoleLogger(successLogger(module));
                    success()
                }
            });
        }
        else {
            consoleLogger(successLogger(module));
            success();
        }
    });
}

function listBucket(error_neg_1, success) {
    var module = 'listBucket';
    var s3 = new AWS.S3();
    s3.listBuckets(function (err, data) {
        if (err) {
            consoleLogger(errorLogger(module, err));
            error_neg_1(-1);
        }
        else {
            consoleLogger(successLogger(module));
            success(data);
        }
    });
}

module.exports = {
    ensureBucket: function (bucketName, error_neg_1, success) {
        ensureBucket(bucketName, error_neg_1, success);
    },

    listBuckets: function (error_neg_1, success) {
        listBucket(error_neg_1, success)
    },

    uploadPublicFileToBucket: function (toBucket, key, filePath, error_neg_1, success) {
        var module = 'uploadPublicFileToBucket';
        var s3 = new AWS.S3();
        var params = {
            Bucket: toBucket,
            Key: key,
            ACL: 'public-read-write',
            Body: fs.createReadStream(filePath)
        };
        s3.putObject(params, function (err, data) {
            if (err) {
                consoleLogger(errorLogger(module, err));
                error_neg_1(-1);
            } else {
                consoleLogger(successLogger(module));
                success(data);
            }
        });
    }
};