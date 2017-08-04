const mongoose = require('mongoose')
//var MongoClient = require('mongodb').MongoClient
const pwd = require('../index.js')
//var url = 'mongodb://localhost:27017/position'
const url = 'mongodb://Root:' + pwd.pwd + '@bus-stop-shard-00-00-qemej.mongodb.net:27017,bus-stop-shard-00-01-qemej.mongodb.net:27017,bus-stop-shard-00-02-qemej.mongodb.net:27017/position?ssl=true&replicaSet=bus-stop-shard-0&authSource=admin'

let Schema = mongoose.Schema
let positionSchema = new Schema({
  Lat: Number,
  Lng: Number,
  City: String,
  District: String,
})

let position = mongoose.model('position', positionSchema)

function store(Lat, Lng, City, District) {
  let db = new position({
    Lat,
    Lng,
    City,
    District
  })
  return new Promise((resolve, reject) => {
    position.findOne({ Lat, Lng }, (err, res) => {
      if (!err && res === null) {
        db.save()
        resolve()
      }
    })
  })
}

function lookup(Lat, Lng) {
  return new Promise((resolve, reject) => {
    position.findOne({ Lat, Lng }, (err, db) => {
      if (err)
        reject(err)
      else {
        if (db === null)
          reject()
        else
          resolve({
            City: db.City,
            District: db.District
          })
      }
    })
  })
}

function connect() {
  mongoose.connect(url)
  console.log(`mongo connect`)
}

function close() {
  mongoose.connection.close()
  console.log(`mongo close`)
}

module.exports = {
  lookup,
  store,
  connect,
  close
}