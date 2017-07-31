var MongoClient = require('mongodb').MongoClient

var url = 'mongodb://localhost:27017/position'

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