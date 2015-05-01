var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    postUniqueCuid: {type: String, required: true, unique: true, index: true},
    postIndex: {type: Number, default: 0, required: true, unique: true, index: true},
    authorUniqueCuid: {type: String, required: true, unique: false, index: true},
    authorName: {type: String, required: true, unique: false, index: true},
    authorUsername: {type: String, required: true, unique: false, index: true},
    authorEmail: {type: String, required: true, unique: false, index: true},
    postHeading: {type: String, required: true, index: true},
    postContent: {type: String, required: true, index: true},
    postSummary: {type: String, required: true, index: true},
    numberOfVisits: {type: Number, default: 0, index: true},
    createdAt: {type: Date, default: Date.now, index: true}
});

module.exports = postSchema;