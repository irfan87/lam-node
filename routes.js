var express = require('express');
var passport = require('passport');

// attach the user model from models
var User = require('./models/user');

// set the router
var router = express.Router();

// set the variable for the templates
router.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");

  next();
});

// queries all users collection from mongodb
router.get('/', function(req, res, next){
  User.find().sort({createdAt: "descending"}).exec(function(err, users){
    if(err){
      return next(err);
    }

    res.render("index", {users: users});
  });
});

// get the sign up form
router.get('/signup', function(req, res){
  res.render('signup');
});

// post the new user from the sign up form
router.post('/signup', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;

  // find the user if there is an existed username
  User.findOne({username: username}, function(err, user){
    if(err){ return next(err); }

    // if there is a user used the same username, it will return an error that say the user is already exists
    if(user){
      req.flash("error", "User already exists");
      return res.redirect('/signup');
    }

    // create the new user
    var newUser = new User({
      username: username,
      password: password
    });

    newUser.save(next);
  });

}, passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get('/users/:username', function(req, res, next){
  User.findOne({username: req.params.username}, function(err, user){
    if(err){ return next(err); }

    if(!user){ return next(404); }

    res.render('profile', { user: user });
  });
});

// get login form
router.get('/login', function(req, res){
  res.render("login");
});

// post the login using passport middleware when user want to login
router.post('/login', passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

// logout
router.get("/logout", function(req, res){
  req.logout();
  res.redirect('/');
});

// A function provided by Passport
function ensureAunthenticated(req, res, next){
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page");
    res.redirect('/login');
  }
};

// use ensureAunthenticated method to make an editing profile
router.get('/edit', ensureAunthenticated, function(req, res){
  res.render('edit');
});

router.post('/edit', ensureAunthenticated, function(req, res, next){
  req.user.displayName = req.body.displayName;
  req.user.bio = req.body.bio;

  req.user.save(function(err){
    if(err){ return next(err); }

    req.flash("info", "Profile Updated! Yahoo.....");
    res.redirect('/edit');
  });
});

router.use(function(req, res){
  res.status(404).render('404');
});

module.exports = router;
