const express = require("express");
const router = express.Router(); // new isntance of the express router... all routes are added to it, then its exported.
const passport = require("passport");
const User = require("../models/user");

// Root path - app landing page
router.get("/", function(req, res){ // request / response
	res.render("landing"); // render the landing.ejs page. Always put ejs files inside the View directory as this is where express looks!
})




// AUTH ROUTES
router.get("/register", function(req, res){ // gets us the register form
	res.render("register");
})

// Making a new user, and if that works they are logged in
router.post("/register", function(req, res){
	let newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){// register handles logic of taking password and hashes it, storing the has instead of the plain text password
		if(err){
			console.log(err);
			return res.render("/register"); // return short circuits out of the function if an issue	
			}
			passport.authenticate("local")(req, res, function(){ // local stops users signing up with the same name etc, winner!
				res.redirect("/campgrounds");
			})// passport authenticates using a local strategy, then once its authenticated redirect
	}); 
});

// Auth - login
router.get("/login", function(req, res){ // show login form
	res.render("login");
})

router.post("/login", passport.authenticate("local", // handling login logic - uses middlewear. When request comes in, it hits middle wear first, so authenticates via passports.
		{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
		}), function(req, res){ 
	}); 

// Auth - logout
router.get("/logout", function(req, res){
	req.logout(); // method added through packages, we dont need to do anythign!
	req.flash("success", "logged you out!");
	res.redirect("/campgrounds");
})

// Middlewear - to stop users being able to access a page unless logged in. Just add this middleware to any route an unauthenticated user shouldnt be able to use!
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;