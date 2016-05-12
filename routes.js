var express = require('express');

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

  next();
});

module.exports = router;
