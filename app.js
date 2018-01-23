var bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    localStrategy       = require("passport-local"),
    User                = require("./models/user"),
    flash               = require("connect-flash"),
    express             = require("express"),
    app                 = express();
    
var blogRoutes = require("./routes/blogs"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");

// APP CONFIG
mongoose.connect(process.env.DATABASEURL);
// mongoose.connect("mongodb://Bidyut:bidyutsochlo@ds111638.mlab.com:11638/sochlo");


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());


app.use(require("express-session")({
    secret: "I am the funniest person alive!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Current user config
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// RESTFUL ROUTES
app.use("/blogs",blogRoutes);
app.use("/blogs/:id/comments",commentRoutes);
app.use("/",indexRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING!");
});
