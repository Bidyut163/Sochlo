var express = require("express");
var router = express.Router({ mergeParams: true });
var Blog = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comment Create Route
router.post("/", middleware.isLoggedIn, function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/blogs/" + req.params.id);
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          req.flash("error", "Something went wrong.");
          res.redirect("/blogs/" + req.params.id);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundBlog.comments.push(comment);
          foundBlog.save();
          res.redirect("/blogs/" + req.params.id);
        }
      });
    }
  });
});

//Comment Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err) {
      req.flash("error", "something went wrong");
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        comment: foundComment,
        blog_id: req.params.id
      });
    }
  });
});

//Comment Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      req.flash("error", "something went wrong");
      res.redirect("back");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//Comment Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      req.flash("error", "oops! something went wrong.");
      res.redirect("/blogs/" + req.params.id);
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

module.exports = router;
