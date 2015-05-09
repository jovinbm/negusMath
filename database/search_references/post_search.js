var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSearchSchema = new Schema({
    searchUniqueCuid: {type: String, required: true, unique: true, index: true},
    searchIndex: {type: Number, default: 0, required: true, unique: true, index: true},
    queryString: {type: String, required: true, unique: false, index: true},
    resultObject: {type: Schema.Types.Mixed, default: {}},
    createdAt: {type: Date, default: Date.now, index: true}
});

var textSearch = require('mongoose-text-search');
postSearchSchema.plugin(textSearch);

postSearchSchema.index({
    queryString: "text"
});

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
postSearchSchema.plugin(autoIncrement.plugin, {
    model: 'PostSearch',
    field: 'searchIndex',
    startAt: 1
});

var PostSearchReference = mongoose.model('PostSearch', postSearchSchema);

module.exports = PostSearchReference;