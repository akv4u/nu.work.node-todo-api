const {ObjectID} = require('mongodb');
const {mongoose} = require ('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo');
const {User} = require ('./../server/models/user');

var id = '5a340c639d47012a7094ff2';

// Todo.find({
//   _id: id
// }).then ((todos) => {
//   console.log ('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then ((todo) => {
//   console.log ('Todo', todo);
// });

// if (!ObjectID.isValid(id)) {
//   console.log ('Object id not valid')
// }
// // else {
//   Todo.findById(id).then ((todo) => {
//     if (!todo) {
//       return console.log ('Id not found');
//     }
//     console.log ('Todo', todo);
//   }).catch ((e) => {console.log (e)});
// // }


User.findById(id).then ((user) => {
  if (!todo) return console.log ('Unable to found');
  console.log ('User', user);
}).catch ((e) => { console.log (e)});
