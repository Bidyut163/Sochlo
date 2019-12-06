var middlewareObj = {};
var Comment = require("../models/comment");
var Post = require("../models/post");

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", " You need to login to do that!");
  res.redirect("back");
};

middlewareObj.isAdmin = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      return next();
    }
    res.redirect("back");
  }
  res.redirect("back");
};

middlewareObj.isUser = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isUser) {
      return next();
    }
    res.redirect("back");
  }
  res.redirect("back");
};

middlewareObj.checkPostOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Post.findById(req.params.id, function(err, post) {
      if (err) {
        req.flash("error", " something went wrong.");
        res.redirect("back");
      } else {
        if (post.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You do not have the permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to login first!");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, comment) {
      if (err) {
        req.flash("error", " something went wrong.");
        res.redirect("back");
      } else {
        if (comment.author.id.equals(req.user._id || req.user.isAdmin)) {
          next();
        } else {
          req.flash("error", "You do not have the permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to login first!");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
