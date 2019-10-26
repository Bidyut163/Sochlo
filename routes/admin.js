var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");

router.get("/dashboard", (req, res) => {
  Blog.find({}, (err, blogs) => {
    err ? console.log(err) : res.render("admin/dashboard", { blogs: blogs });
  });
});

router.get("/posts", (req, res) => {
  Blog.find({}, (err, blogs) => {
    err ? console.log(err) : res.render("admin/posts", { blogs: blogs });
  });
});

router.get("/categories", (req, res) => {
  res.render("admin/categories");
});

router.get("/users", (req, res) => {
  res.render("admin/users");
});

router.get("/login", (req, res) => {
  res.render("admin/login");
});

module.exports = router;
