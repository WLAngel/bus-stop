var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/position', {
  useMongoClient: true,
})

var Position = mongoose.model('Positions', {
  Lat: Number,
  Lng: Number,
  City: String,
  District: String
})
var pos = new Position({
  Lat: 24.977783203125,
  Lng: 121.549713134766,
  City: 'Here is City',
  District: 'Here is District'
})
pos.save(function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('try')
  }
})

