const mongoose = require ('mongoose');
const validator = require ('validator');
const jwt = require ('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: '{VALUE} is not a valid email'
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 8
  },
  tokens: [{
    access: {
      type: String,
      require: true
    },
    token: {
      type: String,
      require: true
    }
  }]
}, { // needed as mongodb $pushAll we were getting while saving object.
  usePushEach: true
});

// overrideing toJSON method
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);

}

// instance method definition
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var salt = 'abc123'
  var token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, salt).toString();
  // add tokens to tokens array
  user.tokens.push ({access, token});
  return user.save().then(() => {
    return token;
  });
};

// model method
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  }
  catch (e) {
    // return new Promise((resolve, reject) => {
    //   // always reject
    //   reject ();
    // });
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

// Returns a promise
UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        }
        else {
          reject();
        }
      });
    });
  });
};

// routine to salt and hash password before saving.npm
UserSchema.pre('save', function (next) {
  var user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    })
  }
  else {
    next ();
  }
});

var User = mongoose.model ('User', UserSchema);

module.exports = {User};
