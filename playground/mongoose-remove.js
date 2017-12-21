const {ObjectID} = require('mongodb');

const {mongoose} = require ('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo');
const {User} = require ('./../server/models/user');

// Todo.remove({})
// Todo.remove({}).then ((result) => {
//   console.log(result);
// }).catch((e) => console.log(e));


Todo.findOneAndRemove({_id:'5a3b976c34d28827906c5e62'}).then((todo) => {
  console.log(todo);
});

/* response
{ _id: 5a3b976c34d28827906c5e62,
  text: 'Something to do - Local',
  __v: 0,
  completedAt: null,
  completed: false }
*/

//
// Todo.findByIdAndRemove('5a3a98b94fb2a02a34593fb8').then ((doc) => {
//     console.log(doc)
// });
