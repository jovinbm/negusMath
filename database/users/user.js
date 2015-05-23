var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    uniqueCuid: {type: String, unique: true, index: true},
    hashedUniqueCuid: {type: String, unique: true, index: true},
    email: {type: String, unique: false, index: true},
    emailIsConfirmed: {type: Boolean, unique: false, "default": false, index: true},
    username: {type: String, unique: false, index: true},
    firstName: {type: String, unique: false, index: true},
    lastName: {type: String, unique: false, index: true},
    password: {type: String, unique: false, index: true},
    isAdmin: {type: Boolean, unique: false, "default": false, index: true},
    isRegistered: {type: Boolean, unique: false, "default": false, index: true},
    isApproved: {type: Boolean, unique: false, "default": false, index: true},
    createdAt: {type: Date, default: Date.now, unique: false, index: true},
    isBanned: {
        status: {type: Boolean, default: false, unique: false, index: true},
        reason: {type: String, default: "", unique: false, index: true}
    }
});

var User = mongoose.model('User', userSchema);
module.exports = User;