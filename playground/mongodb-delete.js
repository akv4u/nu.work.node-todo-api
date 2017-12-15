const {MongoClient, ObjectID} = require ('mongodb');
const url = 'mongodb://localhost:27017';
const dbTodoApp = 'TodoApp';

// Use connect method to connect to the server
MongoClient.connect(url, (err, client) => {
  if (err) {
    return console.log (JSON.stringify (err, undefined, 2));
  }
  console.log ('Connected to mongo db');
  //connect to database
  const db = client.db (dbTodoApp);

  // deleteMany

  // db.collection ('Todos')
  // .deleteMany({
  //   text:'Something to do 8'
  // }).then ((result) => {
  //   //console.log (JSON.stringify(result, undefined, 2));
  //   console.log (result)
  //   if (result.CommandResult.result.ok === 1) {
  //     console.log (`Deleted ${result.CommandResult.result.n} records!`);
  //   }
  //   else {
  //     console.log ('Could not execute delete!');
  //   }
  // });

  // deleteOne

  // findOneAndDelete
  db.collection('Todos')
  .findOneAndDelete ({_id:new ObjectID('5a3009fddd3f1a16943693da')})
  .then((result) => {
    console.log (result);
  });


  //client.close();
});
