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

  //fineOneAndUpdate
  db.collection('Todos').findOneAndUpdate({
    "_id" : ObjectID("5a314cc4bbb02ef9d255f0e7")
  }, {
    $set: {
      "text" : "Something to do 66",
    }
  }, {
    returnOriginal: false
  }).then ((result) => {
    console.log (result);
  })

  db.collection('Users').findOneAndUpdate({
    "_id" : ObjectID("5a300c85cf8f852a401095a7")
  }, {
    $inc: { age: -10}
  }, {
    returnOriginal: false
  }).then ((result) => {
    console.log (result);
  })

  //client.close();
});
