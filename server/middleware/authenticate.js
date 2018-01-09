const {User} = require('./../models/user');

// middleware for authenticate
var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next(); // this is required, otherwise code below wont execute.
  }).catch((e) => {
    res.status(401).send();
  });
}

module.exports = {authenticate};
