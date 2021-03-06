
const {ObjectID} = require ('mongodb');
const expect     = require ('expect');
const request    = require ('supertest');
const mongoose   = require ('mongoose');

const {app} = require ('../server')
const {Todo} = require ('./../models/todo');
const {User} = require ('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach (populateTodos);
beforeEach (populateUsers);

describe ('POST /todos', () => {
  it ('should create a new todo', (done) => {
    var text = 'test - new phone';
    request(app)
    .post('/todos')
    .send({text})
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect (res.body.text).toBe(text);
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => done (e));
    });
  });

  it ('should not create todo with invalid data', (done) => {
    request(app)
    .post('/todos')
    .send({})
    .set('x-auth', users[0].tokens[0].token)
    .expect(400)
    .end((err, res) => {
      if (err) return done(err);
      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch ((e) => done(e));
    });
  });
});

describe ('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(1);
    }).end(done);
  });
});

describe ('GET /todos/:id', () => {
  // test 1
  it ('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    }).end(done);
  });

  // test 2
  it ('should return 404 non-object ids', (done) => {
    request(app)
     .get(`/todos/123ABC`)
     .set('x-auth', users[0].tokens[0].token)
     .expect(400)
     .end(done);
  });

  // test 3
  it('should return 404 if todo is not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
     .get(`/todos/${hexId}`)
     .set('x-auth', users[0].tokens[0].token)
     .expect(404)
     .end(done);
  });

  it ('should not return doc created by other user', (done) => {
    request(app)
    .get(`/todos/${todos[1]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });
});


describe ('DELETE /todos/:id', () => {
  it ('should return 400 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it ('should return 404 if non-object id is passed', (done) => {
    request(app)
      .delete('/todos/123ABC')
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end(done);
  });

  it ('should remove a todo requested', (done) => {
    var hexId0 = todos[0]._id.toHexString();
    var hexId1 = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId0}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId0);
      }).end((err, res) => {
        if (err) {
          return done (err);
        }
        Todo.findById(hexId0).then((todo) => {
          expect(todo).toBeNull();
          done();
        }).catch ((e) => done (e));
      });
  });
});

it ('should remove a todo requested', (done) => {
  var hexId0 = todos[0]._id.toHexString();
  var hexId1 = todos[1]._id.toHexString();

  request(app)
    .delete(`/todos/${hexId0}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end((err, res) => {
      if (err) {
        return done (err);
      }
      Todo.findById(hexId0).then((todo) => {
        expect(todo).toBeTruthy();
        done();
      }).catch ((e) => done (e));
    });
});

describe ('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = "TEST Patch - Local";
    var completed = true;

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text, completed})
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        //expect(res.body.todo.completedAt).toBeTruthy();
        expect(typeof res.body.todo.completedAt).toBe('number');
      }).end((err, res) => {
        if (err) {
          return done (err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toEqual(text);
          expect(todo.completed).toBe(true);
          done();
        }).catch((e) => done(e));
     });
  });

  it('should not update the todo created by other user', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = "TEST Patch - Local";
    var completed = true;

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text, completed})
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done (err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).not.toEqual(text);
          expect(todo.completed).toBe(false);
          done();
        }).catch((e) => done(e));
     });
  });


  it('should clear completedAt when todo is not complete', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = "TEST Patch 2 - Local";
    var completed = false;

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text, completed})
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completedAt).toBeNull();
        expect(res.body.todo.text).toBe(text);
      }).end((err, res) => {
        if (err) {
          return done (err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toEqual(text);
          expect(todo.completed).toBe(false);
          done();
        }).catch((e) => done(e));
     });
  });
});

describe ('GET /users/me', () => {
  it ('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });

  it ('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', "")
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe ('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'test.users@email.com';
    var password = '1234abcd'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy(); // toExist is depricated since jest
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      }).end((err, res) => {
        if (err) {
          return done (err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password)
          done();
        }).catch((e) => done(e));
     });
  });


  it('should return validation errors if request invalid', (done) => {
    var email = 'test.users@';
    var password = '1234abcd'
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.body).toBeTruthy();
      }).end((err, res) => {
        if (err) {
          return done (err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toBeNull();
          done();
        }).catch((e) => done(e));
     });
  });

  it('should not create user if email in use', (done) => {
    request(app)
       .post('/users')
       .send({
              email: users[0].email,
              password: 'somepassword'
       })
       .expect(400)
       .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    let email     = users[0].email;
    let password  = users[0].password;
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy(); // toExist is depricated since jest
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.toObject().tokens[1]).toMatchObject ({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invali login', (done) => {
    let email     = users[0].email;
    let password  = 'somePassword';
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy(); // toExist is depricated since jest
      }).end(done);
  });
});


describe('DELETE /users/me/token', () => {
  it('it should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (!err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(users.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
})
