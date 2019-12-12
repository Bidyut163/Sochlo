var bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  User = require("./models/user"),
  middleware = require("./middleware"),
  flash = require("connect-flash"),
  express = require("express"),
  app = express();

var postRoutes = require("./routes/posts"),
  commentRoutes = require("./routes/comments"),
  indexRoutes = require("./routes/index"),
  adminRoutes = require("./routes/admin");

// APP CONFIG
var url = process.env.DATABASEURL || "mongodb://localhost/sochlo";
mongoose.connect(url, { useMongoClient: true });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());

app.use(
  require("express-session")({
    secret: "I am the funniest person alive!",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.locals.moment = require("moment");
//Current user config
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// RESTFUL ROUTES
app.use("/admin", middleware.isLoggedIn, middleware.isUser, adminRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:id/comments", commentRoutes);
app.use("/", indexRoutes);

const port = process.env.PORT || 5000;

app.listen(port, process.env.IP, function() {
  console.log("SERVER IS RUNNING AT PORT", port);
});
