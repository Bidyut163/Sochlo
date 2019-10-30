var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var Category = require("../models/category");
var middleware = require("../middleware");
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

// INDEX ROUTE
router.get("/", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log("ERROR!");
    } else {
      res.render("blogs/index", { blogs: blogs });
    }
  });
});

// NEW ROUTE
router.get("/new", middleware.isAdmin, function(req, res) {
  res.render("blogs/new");
});

// CREATE ROUTE
router.post("/", middleware.isAdmin, upload.single("image"), (req, res) => {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.blog.image = result.secure_url;
    // add author to campground
    req.body.blog.author = {
      id: req.user._id,
      username: req.user.username
    };
    Blog.create(req.body.blog, function(err, blog) {
      if (err) {
        req.flash("error", "something went wrong");
        return res.redirect("back");
      }
      res.redirect("/blogs/");
    });
  });
});

// SHOW ROUTE
router.get("/:id", function(req, res) {
  Category.find({}, (err, categories) => {
    err
      ? console.log(err)
      : Blog.findById(req.params.id)
          .populate("comments")
          .exec(function(err, foundBlog) {
            if (err) {
              res.redirect("/blogs");
            } else {
              Blog.find({ category: foundBlog.category }, (err, blogs) => {
                err
                  ? console.log(err)
                  : res.render("posts/post", {
                      blog: foundBlog,
                      blogs: blogs,
                      categories: categories
                    });
              });
            }
          });
  });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
  Category.find({}, (err, categories) => {
    if (err) {
      console.log(err);
      res.redirect("/admin/posts");
    } else {
      Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
          res.redirect("/blogs");
        } else {
          res.render("admin/editPost", {
            blog: foundBlog,
            categories: categories
          });
        }
      });
    }
  });
});

// UPDATE ROUTE
router.put("/:id", middleware.isAdmin, function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE ROUTE
router.delete("/:id", middleware.isAdmin, function(req, res) {
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/admin/posts");
    }
  });
  //redirect somewhere
});

module.exports = router;
