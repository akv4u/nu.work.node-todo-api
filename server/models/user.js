const mongoose = require ('mongoose');

var User = mongoose.model ('User', {
  name: {
    type: String,
    minLength: 1,
    trime: true
  },
  email: {
    type:String,
    required: true
  }
});


module.exports = {User};
