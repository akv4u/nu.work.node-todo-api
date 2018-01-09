const mongoose = require ('mongoose');
const validator = require ('validator');
const jwt = require ('jsonwebtoken');
const _ = require('lodash');

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

var User = mongoose.model ('User', UserSchema);

module.exports = {User};
