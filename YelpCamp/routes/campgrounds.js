const express = require("express");
const router = express.Router(); // new isntance of the express router... all routes are added to it, then its exported.
const Campground = require("../models/campground");
const Comment = require("../models/comment"); // so that comments can also be deleted from here
const middleware = require("../middleware"); // because the middleware file is called index.js, we dont need to explicityl put / index.js at the end as express will look here by default

// Need method-overide to deal with PUT requests

// page to show all of the campgrounds and their details
// This is the INDEX ROUTE - displays a list of all items
router.get("/", function(req, res){
	// Get all campgrounds from mongodb via find
	Campground.find({
		
	}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			// Render campgrounds to page
			res.render("campgrounds/index", {campgrounds: allCampgrounds} ); // passing in campgrounds data from database, which will be called campgrounds in the ejs file
		}
	})
	
	
})

// make a new campground and redirect back to /campgrounds
// This is the CREATE route - Adds a new item into Database --> where the form sends the input data
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form - add to database
	// shows the form to send data to the post route; to get form data, req.body... input name.
	console.log(req.user); // req.user gives infomration about currently logged in user.
	let name = req.body.name;
	let image = req.body.image;
	let price = req.body.price;
	let desc = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username
	};
	let newCampground = {name: name, image: image, price: price,description: desc, author: author};
	//Create a new campground and save to database
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			//Redirect back to /campgrounds with update
			res.redirect("/campgrounds");
		}
	})

})

// This is the NEW route - Displays form to make new object / item / data
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
})

// This is the SHOW Route - Shows info about one item. Needs to be bellow campgrounds/new so that it doesnt accept 'new', as it will accept any words after campgrounds/
router.get("/:id", function(req, res){
	// find the campground with provided id
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){ // finding a campground, populating the comments on that campground (this actually popualates the comments array inside campground with the comments data), then executing the code with .exec
		console.log(foundCampground);
		if(err || !foundCampground){ // need to include !foundCampground to catch error or no campground being found incase a user changes the id
			req.flash("error", "Campground not found");
			res.redirect("back");
		}
		else{
			// if found, pass in the foundCampground as a varaible to the show template, accessed as 'campgound'
			res.render("campgrounds/show", {campground: foundCampground})
		}
	});
	// render the show page template with that campground
})

// Edit Campground Route - form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
		Campground.findById(req.params.id, function(err, foundCampground){
			res.render("campgrounds/edit", {campground: foundCampground}); // Need to pass in the campground we're editing to get its ID
		});
});

// Update Campground Route - form submits here
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
	// find and update the correct camp Campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})


// Campground Delete Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            deletedCampground.comments.forEach(function(comment){ // delete the comments associated with the campground
                Comment.findByIdAndRemove(comment, function(err){
                    if(err){
                        console.log(err);
                    }
                });
            });
            res.redirect("/campgrounds");
        }
    });
});

			
module.exports = router;