const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
	username: String,
	password: String
});

UserSchema.plugin(passportLocalMongoose); // Adds methods to our schema

module.exports = mongoose.model("User", UserSchema);