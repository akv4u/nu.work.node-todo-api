require ('./config/config');
const          _ = require('lodash');
const express    = require ('express');
const bodyParser = require ('body-parser');
const {ObjectId} = require ('mongodb');

const {mongoose} = require ('./db/mongoose');
const {Todo}     = require ('./models/todo');
const {User}     = require ('./models/user');
const {authenticate}     = require ('./middleware/authenticate');
const bcrypt = require('bcryptjs');

var app = express ();
const port = process.env.PORT;

app.use(bodyParser.json());

// handling bad json
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.log('BAD JSON!')
    res.status(500).send('Bad JSON!')
  }
  else {
    console.error(err.stack)
    res.status(500).send('Bad JSON!')
  }
});

// create new todo
app.post ('/todos', (req, res) => {
  var todo = new Todo ({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET /todos
app.get('/todos', (req, res) => {
  Todo.find().then ((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET /todo/:id
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send();
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch ((e) => {
    return  res.status(400).send(e)
  }
  );
});


// DELETE /todo/:id
app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send();
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => res.status(400).send());
});

// PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send();
  }
  var body = _.pick(req.body, ['text', 'completed']);
  // if marked completd, update timestamp
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }
  else {
    body.completed  = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate (
    id,
    {$set: body},
    {new: true}
  ).then ((todo) => {
    if (!todo) return res.status(404).send();
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
}); ;


// POST /users
app.post('/users', (req, res) => {
  // var user = new User ({
  //   email: req.body.email,
  //   password: req.body.password
  // });
  var body = _.pick (req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
    // res.send(user);
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// GET /users
app.get('/users', (req, res) => {
  User.find().then((users) => {
    res.send(users);
  }, (e) => {
    res.status(400).send(e);
  });
});

// Private route
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST /users/login
app.post('/users/login', (req, res) => {
  // // My solution
  // let email    = req.body.email;
  // let password = req.body.password;
  //
  // User.findOne({email}).then((user) => {
  //   if (!user) {
  //     return res.status(404).send();
  //   }
  //   bcrypt.compare(password, user.password).then((valid) => {
  //     user.generateAuthToken().then((token) => {
  //       res.header('x-auth', token).send(user);
  //     });
  //   }).catch((e) => {
  //     res.status(400).send(e);
  //   });
  // }, (e) => {
  //   res.status(400).send(e);
  // });

  let body = _.pick (req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen (port, () => {
  console.log (`Starting server at ${port}`);
});

module.exports = {app};
