var express = require("express"),
    router = express.Router(),
    Blog = require("../models/blog"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

//BLOG INDEX
router.get("/blog", function(req,res) {
  Blog.find({}, function(err, foundBlog) {
    if (err) {
      req.flash("error", "Something went wrong");
      res.redirect("/blog");
    }
    else {
      res.render("index", {blog: foundBlog});
    }
  });
});

//POST NEW BLOG
router.post("/blog", middleware.isLoggedIn, function(req,res) {
  req.body.blog.body = req.sanitize(req.body.blog.body).replace(/\n/g, "<br>");
  req.body.blog.author = { id: req.user._id, username: req.user.username };
  if (!req.body.blog.image || !/\.(jpg|png|gif)$/g.test(req.body.blog.image)) {
    req.body.blog.image = "/images/placeholder1.png";
  }
  Blog.create(req.body.blog, function(err) {
    if (err) {
      req.flash("error", "Something went wrong");
      res.redirect("/blog");
    }
    else {
      req.flash("success", "New blog posted");
      res.redirect("/blog");
    }
  });
});

router.get("/blog/new", middleware.isLoggedIn, function(req,res) {
  res.render("new");
});

//SHOW BLOG
router.get("/blog/:id", function(req,res) {
  Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog) {
    if (err || !foundBlog) {
      req.flash("error", "Not found");
      res.redirect("/blog");
    }
    else {
      res.render("show", {blog: foundBlog});
    }
  });
});


//COMMENT AND EDIT BLOG PAGE
router.get("/blog/:id/edit", middleware.checkBlogOwner, function(req,res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err || !foundBlog) {
      req.flash("error", "Not found");
      res.redirect("/blog");
    }
    else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

//ADD COMMENT/EDIT BLOG
router.put("/blog/:id", middleware.isLoggedIn, function(req,res) {
  if (req.body.blog) {
    req.body.blog.body = req.sanitize(req.body.blog.body).replace(/\n/g, "<br>");
    if (!req.body.blog.image || !/\.(jpg|gif|png)$/g.test(req.body.blog.image)) {
      req.body.blog.image = "/images/placeholder1.png";
    }
    Blog.findById(req.params.id, function(err, foundBlog) {
      if (err || !foundBlog) {
        req.flash("error", "Not found");
        return res.redirect("/blog");
      } else if (foundBlog.author.id.equals(req.user.id)) {
        foundBlog.set(req.body.blog);
        foundBlog.save(function(err) {
          if (err) {
            console.log(err);
            res.redirect("/");
          } else {
            req.flash("success", "Blog updated");
            return res.redirect("/blog/"+req.params.id);
          }
        });
      }
    });
  }
  else {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if (err ||  !foundBlog) {
        res.send("Something went wrong");
      }
      else {
        req.body.comment.comment = req.sanitize(req.body.comment.comment);
        req.body.comment.user = { id: req.user._id, username: req.user.username };
        if (req.body.comment.comment.length > 100) {
          req.flash("error", "Comment exceeds 100 characters");
          res.redirect("back");
        } else {
          req.body.comment.comment = req.body.comment.comment.replace(/\n/g, "<br>");
          Comment.create(req.body.comment, function(err, comment) {
            if (err) {
              console.log(err);
              res.redirect("/");
            } else {
              foundBlog.comments.push(comment);
              foundBlog.save(function(err) {
                if (err) {
                  res.send("Something went wrong");
                } else {
                  req.flash("success", "Comment posted");
                  res.redirect("/blog/"+req.params.id);
                }
              });
            }
          });
        }
      }
    });
  }
});

//DELETE BLOG
router.delete("/blog/:id", middleware.isLoggedIn, middleware.isAdmin, function(req,res) {
  Blog.findOne({ _id: req.params.id }, function(err, blog) {
    if (err || !blog) {
      res.send("Something went wrong");
    }
    else {
      blog.comments.forEach(function(comment) {
        Comment.findByIdAndRemove(comment, function(err) {
          if (err) console.log(err);
        });
      });
      blog.remove();
      req.flash("success", "Blog deleted");
      res.redirect("/blog");
    }
  });
});

//DELETE COMMENT
router.delete("/blog/:parentId/:childId", middleware.isLoggedIn, middleware.checkCommentOwner, function(req,res) {
  Comment.findByIdAndRemove(req.params.childId, function(err, removed) {
    if (err || !removed) {
      console.log(err);
      res.redirect("/");
    } else {
      Blog.findById(req.params.parentId, function(err, foundBlog) {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          foundBlog.comments.remove(req.params.childId);
          foundBlog.save(function() {
            req.flash("success", "Comment deleted");
            res.redirect("/blog/"+req.params.parentId);
          });
        }
      });
    }
  });
});

module.exports = router;
