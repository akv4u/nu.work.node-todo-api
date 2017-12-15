// const MongoClient = require ('mongodb').MongoClient;
// const {MongoClient} = require ('mongodb');
// const {ObjectId} = require ('mongodb'); // ES6 notation, Object destructing
const {MongoClient, ObjectID} = require ('mongodb');

const url = 'mongodb://localhost:27017';
const dbTodoApp = 'TodoApp';


var objId = new  ObjectID ();
console.log (`objId : ${objId}`);

// Object id has timesstamp,
// ObjectId = 12 bytes.
// - 4 bytes time in secs,
// - 3 byte Machine id,
// - 2 bytes process id,
// - 3 id is random counter
console.log ('Time created:', ObjectID("5a31313aafd9f61a4ce34b02").getTimestamp());
console.log ('Time created:', ObjectID("5a300c85cf8f852a401095a7").getTimestamp());


// Use connect method to connect to the server
MongoClient.connect(url, (err, client) => {
  if (err) {
    return console.log (JSON.stringify (err, undefined, 2));
  }

  console.log ('Connected to mongo db');
  //connect to database
  const db = client.db (dbTodoApp);

  // find the user
  // db.collection('Users').findOne ({_id: new ObjectID('5a300c85cf8f852a401095a7')}, (err, result) => {
  //   if (err) return console.log ('Unable to find doc');
  //   if (result === null) return console.log ('No record found');
  //   console.log (JSON.stringify (result, undefined, 2));
  // });
  //

  // Fine all the
  // db.collection('Todos').find(
  //   {
  //     completed:true
  //   }).toArray().then((docs) => {
  //   console.log ('Todos');
  //   console.log (JSON.stringify (docs, undefined, 2));
  // }, (err) => {
  //   console.log ('Unable to print the Todos', err);
  // });
  //

  // Apply a filter to a cursor.
  // db.collection('Todos').find().filter({text: "Something to do 4"}).toArray().then((docs) => {
  //   console.log (JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log ('Unable to print the Todos', err);
  // });

  // do something with each item returned.
  // var cnt = 0;
  // db.collection('Todos').find().forEach((doc) => {
  //   console.log (`cnt =  ${cnt++}`)
  //   console.log (JSON.stringify(doc, undefined, 2));
  // });

  // Explain query Explain
  // db.collection('Todos').find().explain((error, result) => {
  //   if (error) return console.log ('Error in explain', error);
  //   console.log (JSON.stringify(result, undefined, 2));
  // });

  client.close();
});
