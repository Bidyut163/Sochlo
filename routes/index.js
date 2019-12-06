var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var middleware = require("../middleware");
var Post = require("../models/post");
var Category = require("../models/category");

// Image Upload
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
  // Pagination
  var perPage = 9;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;

  Post.find({})
    .sort({ $natural: -1 })
    .skip(perPage * pageNumber - perPage)
    .limit(perPage)
    .exec((err, posts) => {
      Post.count().exec((err, count) => {
        err
          ? console.log(err)
          : Category.find({}, (err, categories) => {
              if (err) {
                console.log(err);
              } else {
                var renderPage;
                pageNumber === 1
                  ? (renderPage = "home")
                  : (renderPage = "posts/nextPagePosts");

                res.render(renderPage, {
                  posts: posts,
                  categories: categories,
                  current: pageNumber,
                  pages: Math.ceil(count / perPage),
                  title: false
                });
              }
            });
      });
    });
});

// CATEGORYWISE POST ROUTE
router.get("/categoryWisePosts/:category", (req, res) => {
  var perPage = 9;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  Category.find({}, (err, categories) => {
    err
      ? console.log(err)
      : Post.find({ category: req.params.category })
          .sort({ $natural: -1 })
          .limit(perPage)
          .exec((err, posts) => {
            Post.count().exec((err, count) => {
              err
                ? console.log(err)
                : res.render("posts/nextPagePosts", {
                    posts: posts,
                    categories: categories,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
                    title: req.params.category
                  });
            });
          });
  });
});

//handles sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to sochlo.in " + user.username);
      res.redirect("/");
    });
  });
});

//login Route
router.get("/login", function(req, res) {
  res.render("admin/login");
});

// handles login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
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
// router.get("/user/:id", middleware.isLoggedIn, function(req, res) {
//   User.findById(req.params.id, function(err, foundUser) {
//     if (err) {
//       req.flash("error", err.message);
//       res.redirect("back");
//     } else {
//       res.render("users/show", { user: foundUser });
//     }
//   });
// });

// add User Profile pic
// router.post(
//   "/user/:id",
//   middleware.isLoggedIn,
//   upload.single("avatar"),
//   function(req, res) {
//     User.findById(req.params.id, function(err, foundUser) {
//       if (err) {
//         req.flash("error", "something went wrong");
//         res.redirect("back");
//       } else {
//         cloudinary.uploader.upload(req.file.path, function(result) {
//           // add cloudinary url for the image to the campground object under image property
//           foundUser.avatar = result.secure_url;
//           foundUser.save();
//           res.redirect("/user/" + req.params.id);
//         });
//       }
//     });
//   }
// );

// Member route
router.get("/members", (req, res) => {
  res.render("member");
});

// About Page route
router.get("/about", (req, res) => {
  res.render("about");
});

//Page Not found Route
router.get("*", function(req, res) {
  res.render("pageNotFound");
});

module.exports = router;
