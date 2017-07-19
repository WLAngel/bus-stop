var express = require('express')
var path = require('path')
var bodyparser = require('body-parser')

var bus = require('./apis/bus_res.js')
var cities = require('./public/static/city.js')

var app = express()


// this is a test resource
var list = [
  { "StopUID": "NWT149600",
    "StopID": "149600",
    "StopName": {
      "Zh_tw": "力行新村",
      "En": "Lixing New Village"
    },
    "RouteUID": "NWT16689",
    "RouteID": "16689",
    "RouteName": {
      "Zh_tw": "793",
      "En": "793"
    },
    "Direction": 0,
    "EstimateTime": 49,
    "MessageType": 0,
    "SrcUpdateTime": "2017-07-19T17:59:50+08:00",
    "UpdateTime": "2017-07-19T17:59:55+08:00",
    "StopSequence": 5
  },
  { "StopUID": "NWT149601",
    "StopID": "149601",
    "StopName": {
      "Zh_tw": "板橋榮家",
      "En": "Banqiao Veterans Home"
    },
    "RouteUID": "NWT16689",
    "RouteID": "16689",
    "RouteName": {
      "Zh_tw": "793",
      "En": "793"
    },
    "Direction": 0,
    "EstimateTime": 142,
    "MessageType": 0,
    "SrcUpdateTime": "2017-07-19T17:59:50+08:00",
    "UpdateTime": "2017-07-19T17:59:55+08:00",
    "StopSequence": 6
  }]



app.set('views', path.join(__dirname, 'public', 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.post('/routes', (req, res) => {
  // TODO should return routes of bus
  var city = req.body.City
  var routename = req.body.RouteName


  res.render('routes', {
    city,
    routename,
    list
  })
})
app.post('/stops', (req, res) => {
  // TODO should return RouteName of bus in a specific StopName
  var city = req.body.City
  var stopname = req.body.StopName
  res.render('stops', {
    city,
    stopname,
  })
})

app.get('/util', (req, res) => {
  res.render('util.pug', cities)
})

// TODO root page reserved
app.get('/', function (req, res) {
  res.send('The Page is Reserved!')
})

app.listen(8888, function () {
  console.log('Example app listening on port 8888!')
})
