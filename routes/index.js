var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    passport = require("passport"),
    middleware = require("../middleware");

//================================
//            ROUTES
//================================
router.get("/", function(req,res) {
  console.log(res.locals.currentUser);
  res.redirect("/blog");
});

//================================
//         AUTH ROUTES
//================================
router.get("/register", function(req,res) {
  res.render("register");
});

router.post("/register", middleware.testPassword, function(req,res) {
  var newUser = new User({username: req.body.username});
  if(req.body.password)
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/login");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome, " + user.username);
      res.redirect("/blog");
    });
  });
});

router.get("/login", function(req,res) {
  res.render("login");
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}), function(req,res) {});

router.get("/logout", function(req,res) {
  req.logout();
  req.flash("success", "You have been logged out");
  res.redirect("/blog");
});

module.exports = router;