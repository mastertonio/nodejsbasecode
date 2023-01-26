var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://anthonyderecho:$3rVerus1..a@cluster0.ejokl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("myFirstDatabase");
  var myquery = {template_id: '62b2b25ea1836f8345704cbd'};
  dbo.collection("templateversions").deleteMany(myquery, function(err, obj) {
    if (err) throw err;
    console.log(obj.result.n + " document(s) deleted");
    db.close();
  });
});