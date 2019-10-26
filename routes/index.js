var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var middleware = require("../middleware");
var Blog = require("../models/blog");

var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dbbwrfcx7",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Index Route
router.get("/", function(req, res) {
  //    res.render("landing");
  Blog.find({}, (err, blogs) => {
    err ? console.log(err) : res.render("home", { blogs: blogs });
  });
});

// sign up form
router.get("/register", function(req, res) {
  res.render("register");
});

//handles sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    secretCode: req.body.secretCode
  });

  if (req.body.secretCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to sochlo.in " + user.username);
      res.redirect("/blogs");
    });
  });
});

//login Route
router.get("/login", function(req, res) {
  res.render("login");
});

// handles login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {}
);

//logout Route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Successfully logged out");
  res.redirect("/login");
});

//User Profile Route
router.get("/user/:id", middleware.isLoggedIn, function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render("users/show", { user: foundUser });
    }
  });
});

// add User Profile pic
router.post(
  "/user/:id",
  middleware.isLoggedIn,
  upload.single("avatar"),
  function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
      if (err) {
        req.flash("error", "something went wrong");
        res.redirect("back");
      } else {
        cloudinary.uploader.upload(req.file.path, function(result) {
          // add cloudinary url for the image to the campground object under image property
          foundUser.avatar = result.secure_url;
          foundUser.save();
          res.redirect("/user/" + req.params.id);
        });
      }
    });
  }
);

//Page Not found Route
router.get("*", function(req, res) {
  res.render("sorry");
});

module.exports = router;
