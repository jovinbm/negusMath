var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    postUniqueCuid: {type: String, required: true, unique: true, index: true},
    postIndex: {type: Number, default: 0, required: true, unique: true, index: true},
    authorUniqueCuid: {type: String, required: true, unique: false, index: true},
    authorName: {type: String, required: true, unique: false, index: true},
    authorUsername: {type: String, required: true, unique: false, index: true},
    authorEmail: {type: String, required: true, unique: false},
    postHeading: {type: String, required: true, index: true},
    postContent: {type: String, required: true},
    postSummary: {type: String, required: true},
    postTags: {type: Array, default: [], index: true, unique: false},
    postUploads: {type: Array, default: [], index: true, unique: false},
    numberOfVisits: {type: Number, default: 0, index: true},
    createdAt: {type: Date, default: Date.now, index: true}
});

var textSearch = require('mongoose-text-search');
postSchema.plugin(textSearch);

postSchema.index({
    authorName: "text",
    authorUsername: "text",
    postHeading: "text",
    postSummary: "text",
    postContent: "text",
    postTags: "text",
    postUploads: "text"
});

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
postSchema.plugin(autoIncrement.plugin, {
    model: 'Post',
    field: 'postIndex',
    startAt: 1
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;