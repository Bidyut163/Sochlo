var express = require("express");
var router = express.Router();
var Post = require("../models/post");
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
// router.get("/", function(req, res) {
//   Post.find({}, function(err, posts) {
//     if (err) {
//       console.log("ERROR!");
//     } else {
//       res.render("home", { posts: posts });
//     }
//   });
// });

// CREATE ROUTE
router.post("/", middleware.isUser, upload.single("image"), (req, res) => {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    req.body.post.image = result.secure_url;
    // add author to campground
    req.body.post.author = {
      id: req.user._id,
      username: req.user.username
    };
    Post.create(req.body.post, function(err, post) {
      if (err) {
        req.flash("error", "something went wrong");
        return res.redirect("back");
      }
      res.redirect("/");
    });
  });
});

// SHOW ROUTE
router.get("/:id", function(req, res) {
  var perPage;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;

  pageNumber === 1 ? (perPage = 3) : (perPage = 9);
  Category.find({}, (err, categories) => {
    err
      ? console.log(err)
      : Post.findById(req.params.id)
          .populate("comments")
          .exec(function(err, foundPost) {
            if (err) {
              res.redirect("/posts");
            } else {
              Post.find({ category: foundPost.category })
                .sort({ $natural: -1 })
                .skip(perPage * pageNumber - perPage)
                .limit(perPage)
                .exec((err, posts) => {
                  Post.count().exec((err, count) => {
                    if (err) {
                      console.log(err);
                    } else {
                      var renderPage;
                      pageNumber === 1
                        ? (renderPage = "posts/post")
                        : (renderPage = "posts/nextPagePosts");
                      res.render(renderPage, {
                        post: foundPost,
                        posts: posts,
                        categories: categories,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage)
                      });
                    }
                  });
                });
            }
          });
  });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.isUser, function(req, res) {
  Category.find({}, (err, categories) => {
    if (err) {
      console.log(err);
      res.redirect("/admin/posts");
    } else {
      Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
          res.redirect("/posts");
        } else {
          res.render("admin/editPost", {
            post: foundPost,
            categories: categories
          });
        }
      });
    }
  });
});

// UPDATE ROUTE
router.put("/:id", middleware.checkPostOwnership, function(req, res) {
  req.body.post.body = req.sanitize(req.body.post.body);
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(
    err,
    updatedPost
  ) {
    if (err) {
      res.redirect("/posts");
    } else {
      res.redirect("/posts/" + req.params.id);
    }
  });
});

// DELETE ROUTE
router.delete("/:id", middleware.checkPostOwnership, function(req, res) {
  //destroy post
  Post.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/admin/posts");
    } else {
      res.redirect("/admin/posts");
    }
  });
  //redirect somewhere
});

module.exports = router;
