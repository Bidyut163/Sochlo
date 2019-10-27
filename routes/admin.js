var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var Category = require("../models/category");

router.get("/dashboard", (req, res) => {
  Blog.find({}, (err, blogs) => {
    err
      ? console.log(err)
      : Category.find({}, (err, categories) => {
          err
            ? console.log(err)
            : res.render("admin/dashboard", {
                blogs: blogs,
                categories: categories
              });
        });
  });
});

router.get("/posts", (req, res) => {
  Blog.find({}, (err, blogs) => {
    err
      ? console.log(err)
      : Category.find({}, (err, categories) => {
          err
            ? console.log(err)
            : res.render("admin/posts", {
                blogs: blogs,
                categories: categories
              });
        });
  });
});

router.get("/categories", (req, res) => {
  Category.find({}, (err, categories) => {
    err
      ? console.log(err)
      : res.render("admin/categories", { categories: categories });
  });
});

// Create Category
router.post("/categories", (req, res) => {
  Category.create(req.body.category, (err, category) => {
    if (err) {
      req.flash("error", "something went wrong");
      return res.redirect("back");
    }
    res.redirect("/admin/categories");
  });
});

// DELETE ROUTE
router.delete("/categories/:id", function(req, res) {
  //destroy category
  Category.findByIdAndRemove(req.params.id, err => {
    if (err) {
      req.flash("error", "something went wrong");
      res.redirect("/admin/categories");
    } else {
      req.flash("success", "succesfully deleted");
      res.redirect("/admin/categories");
    }
  });
  //redirect somewhere
});

router.get("/users", (req, res) => {
  res.render("admin/users");
});

router.get("/login", (req, res) => {
  res.render("admin/login");
});

module.exports = router;
