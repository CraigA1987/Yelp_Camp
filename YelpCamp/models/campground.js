// Schema Setup - what we want the db object to look like - can diverge from this if you want
const mongoose = require("mongoose");

const campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	price: String,
	description: String,
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectId, // links the user with the created campground
			ref: "User"
		},
		username: String
	},
	comments: [ // Reference to comments added here
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		} // we want to know which user posted the new campground, associating the user with the campground
	]
});

const Campground = mongoose.model("Campground", campgroundSchema) // creates model which uses the campground schema created above

module.exports = Campground; // exports Campground as an object of the module. module.exports is basically a return statement, what is returned from the file