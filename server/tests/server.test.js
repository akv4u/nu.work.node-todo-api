
const {ObjectID} = require ('mongodb');
const expect     = require ('expect');
const request    = require ('supertest');
const mongoose   = require ('mongoose');

const {app} = require ('../server')
const {Todo} = require ('./../models/todo');



const todos = [{
  _id: new ObjectID(),
  text:"Test 1 todo"
}, {
  _id: new ObjectID(),
  text:"Test 2 todo",
  completed: true,
  completedAt:333
}];

console.log (JSON.stringify(todos, undefined, 2));

//
beforeEach ((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe ('POST /todos', () => {
  it ('should create a new todo', (done) => {
    var text = 'test - new phone';
    request(app)
    .post('/todos')
    .send({text})
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
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    }).end(done);
  });
});

describe ('GET /todos/:id', () => {
  // test 1
  it ('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    }).end(done);
  });

  // test 2
  it ('should return 404 non-object ids', (done) => {
    request(app)
     .get(`/todos/123ABC`)
     .expect(400)
     .end(done);
  });

  // test 3
  it('should return 404 if todo is not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
     .get(`/todos/${hexId}`)
     .expect(404)
     .end(done);
  });
});


describe ('DELETE /todos/:id', () => {
  it ('should return 400 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it ('should return 404 if non-object id is passed', (done) => {
    request(app)
      .get('/todos/123ABC')
      .expect(400)
      .end(done);
  });

  it ('should delete the todo requested', (done) => {
    var hexId0 = todos[0]._id.toHexString();
    var hexId1 = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId0}`)
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


describe ('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = "TEST Patch - Local";
    var completed = true;

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text, completed})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completedAt).toBeTruthy();
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


  it('should clear completedAt when todo is not complete', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = "TEST Patch 2 - Local";
    var completed = false;

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text, completed})
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
})
