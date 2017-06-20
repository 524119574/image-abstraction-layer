const express = require('express');
const app = express();
const googleImage = require("google-images");
const imageClient = new googleImage("008853606480554279190:xy7m1muddyq", "AIzaSyCcWYjfv_A6qY0KcMZQP5KLwWGE02UF7sY");  //CSE ID and API key to be filled in

var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/my_database_name'; 


app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.get("/api/imgSearch/:name", function(req, res) {
  var imageName = req.params.name;// get the parameter name
  var timeStamp = new Date();
  mongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    db.collection("image-abstraction-layer").insertOne({
      "term": imageName,
      "time": timeStamp
    })
    // do some work here with the database.

    //Close connection
    db.close();
  }
});
  var offset = req.query.offset ? req.query.offset:1; // if offset is defind, use it. If not, don't.
  imageClient.search(imageName, {page: offset})
    .then(images => {
      images.forEach(function(image) {
        delete image.type;
        delete image.width;
        delete image.height;
        delete image.size;
      });
      res.end(JSON.stringify(images));
      console.log(images);
  })
});

app.get("/api/latest/imagesearch/", function(req, res) {
  mongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);

    // do some work here with the database.
    db.collection("image-abstraction-layer").find().sort({"time": -1}).limit(10).toArray(function(err, docs) {
      docs.forEach(function(doc) {
        delete doc._id;
      })
      res.end(JSON.stringify(docs));
    })
    //Close connection
    db.close();
  }
});
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
});