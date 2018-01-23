var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware");

// INDEX ROUTE
router.get("/", function(req, res){
   Blog.find({}, function(err, blogs){
       if(err){
           console.log("ERROR!");
       } else {
          res.render("index", {blogs: blogs}); 
       }
   });
});

// NEW ROUTE
router.get("/new", middleware.isAdmin, function(req, res){
    res.render("new");
});

// CREATE ROUTE
router.post("/", middleware.isAdmin, function(req, res){
    // create blog
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
router.get("/:id", function(req, res){
   Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.isAdmin, function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});


// UPDATE ROUTE
router.put("/:id", middleware.isAdmin, function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
      if(err){
          res.redirect("/blogs");
      }  else {
          res.redirect("/blogs/" + req.params.id);
      }
   });
});

// DELETE ROUTE
router.delete("/:id", middleware.isAdmin, function(req, res){
   //destroy blog
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
   });
   //redirect somewhere
});

module.exports = router;