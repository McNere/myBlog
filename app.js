var express               = require("express"),
    mongoose              = require("mongoose"),
    bodyParser            = require("body-parser"),
    expressSanitizer      = require("express-sanitizer"),
    methodOverride        = require("method-override"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    User                  = require("./models/user"),
    Comment               = require("./models/comment"),
    Blog                  = require("./models/blog"),
    app                   = express(),
    flash                 = require("connect-flash");

//REQUIRING ROUTES
var indexRoutes           = require("./routes/index"),
    blogRoutes            = require("./routes/blog"),
    profileRoutes         = require("./routes/profile");

//================================
//          APP SETUP
//================================
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment")

app.use(require("express-session")({
  secret: "Humblejumbles and apple pies",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//DATABASE CONFIG
mongoose.connect("mongodb://localhost/myblog");

//ROUTES
app.use(indexRoutes);
app.use(blogRoutes);
app.use(profileRoutes);

//DEFAULT ROUTE
app.get("*", function(req,res) {
  res.send("No such page");
});

//================================
//            LISTENER
//================================
app.listen(process.env.PORT, process.env.IP, function() {
  console.log("Server is running");
});
