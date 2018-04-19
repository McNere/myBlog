var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
    
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    admin: {type: Boolean, default: false},
    description: String,
    age: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);