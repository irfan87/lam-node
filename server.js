var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var logger = require('morgan');

// put routes in another file
var routes = require('./routes');

// include setupPassport path
var setupPassport = require('./setupPassport');

var lam_express = express();

// connect mongoose
mongoose.connect('mongodb://localhost:27017/test');

setupPassport();

lam_express.use(logger('dev'));

// set the port. default port is 3000
lam_express.set('port', process.env.PORT || 3000);

lam_express.set('views', path.join(__dirname, 'views'));
lam_express.set('view engine', 'ejs');

// use four middlewares
lam_express.use(bodyParser.urlencoded({extended: false}));
lam_express.use(cookieParser());
lam_express.use(session({
  secret: 'THIS_IS_MY_SECRET',
  resave: true,
  saveUninitialized: true
}));

lam_express.use(flash());

// passport authentication
lam_express.use(passport.initialize());
lam_express.use(passport.session());

lam_express.use(routes);

lam_express.listen(lam_express.get("port"), function(){
  console.log("Server started on port " + lam_express.get("port"));
});
