//=========================
// COMMENTS NESTED ROUTES - they are specific to a campground and its id, so nested into exsisting path /campgrounds/:id/...
//=========================

const express = require("express");
const router = express.Router({mergeParams: true}); // mergeParams gives access to the campground routes :id which we need!
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware"); // because the middleware file is called index.js, we dont need to explicityl put / index.js at the end as express will look here by default

// COMMENT NEW ROUTE --> FORM
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err || !campground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("comments/new", {campground: campground});            
        }
    });
});

// COMMENT POST ROUTE --> Where form is submitted
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
			   // add username and id to comment
			   comment.author.id = req.user._id;
			   comment.author.username = req.user.username;
			   comment.save(); // save comment with its id and username
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to campground
   //redirect campground show page
});

// EDIT ROUTE - show edit form, passing in the comments details
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "No campground found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			}
			else{
				res.render("comments/edit", {campground_id : req.params.id, comment: foundComment});
			}
		});
	});
});

// UPDATE ROUTE - update the comment in the db
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

// DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})



module.exports = router;