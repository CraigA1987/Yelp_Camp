const express = require("express"), 
	  app = express(),
	  bodyParser  = require("body-parser"),
	  mongoose = require("mongoose"),
	  Campground = require("./models/campground"), // Campground Schema is saved as a model to keep the code clean
	  Comment = require("./models/comment"),
	  passport = require("passport"),
	  flash = require("connect-flash"),
	  LocalStrategy = require("passport-local"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  methodOverride = require("method-override"),
	  User = require("./models/user"),
	  seedDB = require("./seeds"); // Seeds file is just used to add starter data

// Require all route files
const commentRoutes = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes = require("./routes/index");

app.use(flash()); // tells app to use connect-flash for flash messages

// PASSPORT CONFIG
app.use(require("express-session")({ // when run express-session we pass in an object
	secret: "thisIsThe secret phrase super exciting",
	resave: false, // have to add these two options
	saveUninitialized: false
}))

app.use(passport.initialize()); // tells node to use passport
app.use(passport.session()); // tells node to use passport

passport.use(new LocalStrategy(User.authenticate())); // The authenticate method comes from passportLocalMongoose so we dont ahve to write it. User localStategy form of authenticate... can chage this to facebooke, google etc.
passport.serializeUser(User.serializeUser()); // methods required to take data from the session and encoding (serialize) and unecoding data (deserialise) - methods automatically added to User Schema as added into user.js
passport.deserializeUser(User.deserializeUser());

// APP CONFIG

console.log(process.env.DATABASEURL); // shows us the local db url on goorm, and the production db on heroku

mongoose.set('useUnifiedTopology', true); 

//Connect to the MongoDB
let url =  process.env.DATABASEURL || "mongodb://localhost/yelp_camp" //Backup url incase environmental variable is dropped locally for some reason

mongoose.connect(url, { //created an environmental variable... if on goorm, run local db, if on heroku run production db. To setup on Heroku go into app on heroku, settings, config vars. Then add the name of the variable, so DATABASEURL and make it equal the full url string with password. Also keeps password out of files and hidden
	useNewUrlParser: true,
	useCreateIndex: true}).then(()=> {
	console.log("connected to DB!");
	}).catch(err => {
		console.log("Error: ", err.message);
	}); // will create the yelp_database for us inside mongodb dynamically

mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({extended: true})); // tells app to use bodyParser for post requests, and sets some setting up
app.set("view engine", "ejs"); // This line means the express now expects ejs template files by default, so we dont need to add .ejs e.g landing.ejs can be called simply landing
app.use(express.static(__dirname + "/public"))// adding custom stylesheet - use __dirname to ensure the directory is always correct incase it changes for whatever reason - this serves the style public directory, but you still need to link to it in the header file!
//seedDB(); // Seeds the Database everytime this file is run... comment out for persistant data

app.use(function(req,res, next){ // pass our req.user to every single template --> MIDDLEWARE
	res.locals.currentUser = req.user;//currentUser variable can now be used in all templates - will be empty if no one logged in.
	res.locals.error = req.flash("error"); // passes the 'message' varaible into every template... necessary as flash messages are in the header of every template so avoids message is undefined errors
	res.locals.success = req.flash("success");
	next();
});

app.use(methodOverride("_method")); // need for PUT Requests - hmtl forms only actually support get and post, but REST conventions require a PUT on update

// Tells app which routes to actually use
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes); // means we dont need to put in /campgrounds at the front in the campgroundroutes.js. add prefix here so we dont need in the routes files.
app.use("/campgrounds/:id/comments", commentRoutes);

// required for server to listen on port 3000 - server always has to listen to something!
app.listen(process.env.PORT || 3000, function() { 
  console.log('Yelp Camp Server has started - Server listening on port 3000'); 
})