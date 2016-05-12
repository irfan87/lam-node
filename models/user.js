// create mongo schema and it's configurations
var mongoose = require('mongoose');

// set the secure password with bcrypt and set the length. longer password, it will reduce the speed to the database
var bcrypt = require('bcrypt-nodejs');

var SALT_FACTOR = 10;

// do-nothing function for bcrypt
var noop = function(){};

var userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  displayName: String,
  bio: String
});

// defines a function that runs before model is saved
userSchema.pre('save', function(done){
  // saves a reference to the user
  var user = this;

  // if password is not modified, we will trigger the done function
  if(!user.isModified("password")){
    return done();
  }

  // generates salts for the hash and calls the inner function once completed
  bcrypt.genSalt(SALT_FACTOR, function(err, salt){
    if(err){
      return done(err);
    }

    bcrypt.hash(user.password, salt, noop, function(err, hashedPassword){
      if(err){
        return done(err);
      }

      user.password = hashedPassword;
      done();
    });
  });
});


// send the guess password. if guess password is match to actual password, user can logged in
userSchema.methods.checkPassword = function(guess, done){
  bcrypt.compare(guess, this.password, function(err, isMatch){
    done(err, isMatch);
  });
};

// get the user name if they already registered
userSchema.methods.name = function(){
  return this.displayName || this.username;
};

var User = mongoose.model("User", userSchema);
module.exports = User;
