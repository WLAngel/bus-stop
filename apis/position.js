var MongoClient = require('mongodb').MongoClient
var pwd = require('../index.js')
// var url = 'mongodb://localhost:27017/position'
var url = 'mongodb://Root:' + pwd.pwd + '@bus-stop-shard-00-00-qemej.mongodb.net:27017,bus-stop-shard-00-01-qemej.mongodb.net:27017,bus-stop-shard-00-02-qemej.mongodb.net:27017/position?ssl=true&replicaSet=bus-stop-shard-0&authSource=admin'

function store(Lat, Lng, City, District) {
  MongoClient.connect(url, (err, db) => {
    var collection = db.collection('positions')
    collection.insertOne({
      Lat,
      Lng,
      City,
      District
    })
    db.close()
  })
}

function lookup(Lat, Lng) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      var collection = db.collection('positions')
      collection.findOne({ Lat, Lng }).then(x => {
        db.close()
        if(x === null)
          return reject()
        resolve({
          City: x.City,
          District: x.District
        })
      })
    })
  })
}

module.exports = {
  lookup,
  store
}