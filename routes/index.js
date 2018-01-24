var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
    
router.get("/", function(req, res){
   res.redirect("/blogs"); 
});

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser= new User({
        username:req.body.username,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        secretCode:req.body.secretCode
    });
    if(req.body.secretCode === "AnkitaBidyutAbhilasha"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to sochlo.in " + user.username);
            res.redirect("/blogs");
        });
    });
});

router.get("/login", function(req, res){
   res.render("login"); 
});


router.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: 'Welcome to sochlo.in'
}), function(req, res) {
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/login");
});

router.get("*", function(req, res) {
    res.render("sorry");
});


module.exports = router;