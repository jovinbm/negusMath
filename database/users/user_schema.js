var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    uniqueCuid: {type: String, unique: true, index: true},
    isAdmin: {type: String, unique: false, "default": "no", index: true},
    email: {type: String, unique: false, index: true},
    username: {type: String, unique: false, index: true},
    firstName: {type: String, unique: false, index: true},
    lastName: {type: String, unique: false, index: true},
    password: {type: String, unique: false, index: true},
    isRegistered: {type: String, unique: false, "default": "no", index: true},
    createdAt: {type: Date, default: Date.now, unique: false, index: true}
});

module.exports = userSchema;