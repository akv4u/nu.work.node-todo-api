const {ObjectID} = require('mongodb');
const jwt = require ('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


const userOneId = new ObjectID ();
const userTwoId = new ObjectID ();

const users = [{
  _id: userOneId,
  email:'user1.email@example.com',
  password:'userOnePassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id:userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email:'user2.email@example.com',
  password:'userTwoPassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id:userTwoId, access: 'auth'}, 'abc123').toString()
  }]
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]);
  }).then(() => done());;
}

const todos = [{
  _id: new ObjectID(),
  text:"Test 1 todo",
  _creator:userOneId

}, {
  _id: new ObjectID(),
  text:"Test 2 todo",
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

console.log (JSON.stringify(todos, undefined, 2));

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};



module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
