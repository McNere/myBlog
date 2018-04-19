var Blog = require("../models/blog");
var Comment = require("../models/comment");
var User = require("../models/user");

var middleware = {};

middleware.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You must be logged in to do that");
    res.redirect("/login");
  }
};

middleware.isAdmin = function(req, res, next) {
  if (res.locals.currentUser.admin) {
    return next();
  } else {
    req.flash("error", "You are not authorized to do that");
    res.redirect("back");
  }
};

middleware.checkBlogOwner = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.admin) {
      return next();
    } else {
      Blog.findById(req.params.id, function(err, foundBlog) {
        if (err || !foundBlog) {
          req.flash("error", "Not found");
          return res.redirect("/blog");
        } else if (foundBlog.author.id.equals(req.user.id)) {
          return next();
        } else {
          req.flash("error", "You are not permitted to do that");
          return res.redirect("/blog");
        }
      });
    }
  } else {
    req.flash("error", "You must be logged in to do that");
    return res.redirect("/login");
  }
};

middleware.checkCommentOwner = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.admin) {
      return next();
    } else {
      Comment.findById(req.params.childId, function(err, foundComment) {
        if (err || !foundComment) {
          req.flash("error", "Not found");
          return res.redirect("/blog");
        } else if (foundComment.user.id.equals(req.user.id)) {
          return next();
        } else {
          req.flash("error", "You are not permitted to do that");
          return res.redirect("/blog");
        }
      });
    }
  } else {
    req.flash("error", "You must be logged in to do that");
    res.redirect("/login");
  }
};

middleware.sameUser = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.admin) {
      return next();
    } else {
      User.findOne({username: req.params.username}, function(err, foundUser) {
        if (err || !foundUser) {
          req.flash("error", "Not found");
          res.redirect("/blog");
        } else if (foundUser._id.equals(req.user._id)) {
          return next();
        } else {
          req.flash("error", "You are not permitted to do that");
          return res.redirect("/user/"+req.params.username);
        }
      });
    }
  } else {
    req.flash("error", "You must be logged in to do that");
    return res.redirect("/blog");
  }
};

middleware.testPassword = function(req,res,next) {
  var strength = /[A-Z]/g.test(req.body.password) + /[a-z]/g.test(req.body.password) + /\d/g.test(req.body.password) + (req.body.password.length > 6);
  if (strength === 4) {
    return next();
  } else {
    req.flash("error", "Password does not meet the requirements");
    return res.redirect("/register");
  }
};

module.exports = middleware;