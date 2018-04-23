var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

//USER PROFILE
router.get("/user/:username", middleware.isLoggedIn, function(req,res) {
  User.findOne({username: req.params.username}, function(err, foundUser) {
    if (err || foundUser === null) {
      req.flash("error", "User not found");
      res.redirect("/blog");
    } else {
      Comment.find().where("user.id").equals(foundUser._id).exec(function(err, comment) {
        if (err || !comment) {
          console.log(err);
        }
        else if (comment[0]) {
          res.render("profile", {user: foundUser, comments: comment});
        } else {
          res.render("profile", {user: foundUser, comments: null});
        }
      });
    }
  });
});

//EDIT USERPROFILE
router.get("/user/:username/edit", middleware.sameUser, function(req,res) {
  User.findOne({username: req.params.username}, function(err, foundUser) {
    if (err || foundUser === null) {
      req.flash("error", "Something went wrong?");
      return res.redirect("/blog");
    }
    else {
      res.render("editprofile", {user: foundUser});
    }
  })
});

//POST EDIT USERPROFILE
router.put("/user/:username/:id", middleware.sameUser, function(req,res) {
  User.findByIdAndUpdate(req.params.id, req.body.user, function(err, user) {
    if (err || !user) {
      console.log(err);
      res.redirect("/blog");
    }
    else {
      res.redirect("/user/"+req.params.username);
    }
  });
});

module.exports = router;
