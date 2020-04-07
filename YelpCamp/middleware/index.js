const Campground = require("../models/campground");
const Comment = require("../models/comment");

// all the middlewear goes here
const middlewareObj = {}

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){ // have to be logged in
		Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){ //error or an item missing --> if we dont handle this it will crash app!
			req.flash("error", "Campground not found");
			res.redirect("back"); // back just goes back to where you where
		}else{ // Does user owns campground? - needs to! 
			if(foundCampground.author.id.equals(req.user._id)){ //.equals is a mongoose method to allow us to compare foundCampground.author.id to req.user._id... They look the same but the first is 	actully a mongo object so can't be directly compared. Equals is built in to solve this issue.
				next(); // Need to pass in the campground we're editing to get its ID
				}
				else{
					req.flash("error", "You don't have permission to do that");
				res.redirect("back");
				}
			}
	});
	};
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){ // have to be logged in
		Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err || !foundComment){
			req.flash("error", "Comment no found");
			res.redirect("back") // back just goes back to where you where
		} else{ // Does user owns comment? - needs to! 
			if(foundComment.author.id.equals(req.user._id)){ //.equals is a mongoose method to allow us to compare foundCampground.author.id to req.user._id... They look the same but the first is actully a mongo object so can't be directly compared. Equals is built in to solve this issue.
			next(); // Need to pass in the campground we're editing to get its ID
			}
			else{
				req.flash("error", "You don't have permission to do that");
				res.redirect("back");
			}
			
		}
		})
	}
};

// Middlewear - to stop users being able to access a page unless logged in. Just add this middleware to any route an unauthenticated user shouldnt be able to use!

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please Login First!");
	res.redirect("/login");
};



module.exports = middlewareObj;