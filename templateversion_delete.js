var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://anthonyderecho:$3rVerus1..a@cluster0.ejokl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const ObjectId = require('mongodb').ObjectID;

MongoClient.connect(url, function(err, db) {
  db.copyDatabase("myFirstDatabase")
  // if (err) throw err;
  // var dbo = db.db("myFirstDatabase");
  // var myquery = {contact_email: 'a.derecho@gmail.com'};
  // dbo.collection("companies").deleteMany(myquery, function(err, obj) {
  //   if (err) throw err;
  //   console.log(obj.result.n + " document(s) deleted");
  //   db.close();
  // });
});