var express = require('express')
var path = require('path')
var bodyparser = require('body-parser')

var bus = require('./apis/bus_res.js')
var c = require('./public/static/city.js')

var app = express()


// this is a test resource
var stoplist = [
  { "StopName": {
      "Zh_tw": "力行新村",
      "En": "Lixing New Village"
    },
    "RouteName": {
      "Zh_tw": "793",
      "En": "793"
    },
    "Direction": 0,
    "EstimateTime": 49,
    "SrcUpdateTime": "2017-07-19T17:59:50+08:00",
    "UpdateTime": "2017-07-19T17:59:55+08:00",
    "StopSequence": 5
  },
  { "StopName": {
      "Zh_tw": "板橋榮家",
      "En": "Banqiao Veterans Home"
    },
    "RouteName": {
      "Zh_tw": "793",
      "En": "793"
    },
    "Direction": 0,
    "EstimateTime": 142,
    "SrcUpdateTime": "2017-07-19T17:59:50+08:00",
    "UpdateTime": "2017-07-19T17:59:55+08:00",
    "StopSequence": 6
  }
]

var routelist = [
  {
    "RouteName": {
      "Zh_tw": "棕7",
      "En": "BR7"
    },
    "Direction": 0,
    "Stops": [
      {
        "StopUID": "NWT13799",
        "StopID": "13799",
        "StopName": {
          "Zh_tw": "安祥路口",
          "En": "Anxiang Rd. Intersection"
        },
        "StopBoarding": 0,
        "StopSequence": 1,
        "StopPosition": {
          "PositionLat": 24.955150604248,
          "PositionLon": 121.49210357666
        }
      },
      {
        "StopUID": "NWT13801",
        "StopID": "13801",
        "StopName": {
          "Zh_tw": "大茅埔",
          "En": "Damaopu"
        },
        "StopBoarding": 0,
        "StopSequence": 2,
        "StopPosition": {
          "PositionLat": 24.9546337127686,
          "PositionLon": 121.495101928711
        }
      },
    ],
    "UpdateTime": "2017-07-20T00:02:23+08:00"
  },
  {
    "RouteName": {
      "Zh_tw": "棕7",
      "En": "BR7"
    },
    "Direction": 1,
    "Stops": [
      {
        "StopUID": "NWT13883",
        "StopID": "13883",
        "StopName": {
          "Zh_tw": "消防局(松仁)",
          "En": "Fire Department(Songren)"
        },
        "StopBoarding": 0,
        "StopSequence": 1,
        "StopPosition": {
          "PositionLat": 25.0391330718994,
          "PositionLon": 121.568252563477
        }
      },
      {
        "StopUID": "NWT13885",
        "StopID": "13885",
        "StopName": {
          "Zh_tw": "興雅國中",
          "En": "Xingya Junior High School"
        },
        "StopBoarding": 0,
        "StopSequence": 2,
        "StopPosition": {
          "PositionLat": 25.0366668701172,
          "PositionLon": 121.568283081055
        }
      },
      {
        "StopUID": "NWT13887",
        "StopID": "13887",
        "StopName": {
          "Zh_tw": "信義行政中心(松仁)",
          "En": "Xinyi Dist. Admin. Center(Songren)"
        },
        "StopBoarding": 0,
        "StopSequence": 3,
        "StopPosition": {
          "PositionLat": 25.0338497161865,
          "PositionLon": 121.568298339844
        }
      },
    ],
    "UpdateTime": "2017-07-20T00:02:23+08:00"
  }
]

app.set('views', path.join(__dirname, 'public', 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.post('/routes', (req, res) => {
  // TODO error handling
  var city = req.body.City
  var routename = req.body.RouteName

  res.render('routes', {
    city,
    routename,
    stoplist
  })
})
app.post('/stops', (req, res) => {
  // TODO error handling
  var city = req.body.City
  var stopname = req.body.StopName
  res.render('stops', {
    city,
    stopname,
    routelist
  })
})

app.get('/bus', (req, res) => {
  res.render('bus.pug', {
    cities: c.cities
  })
})

app.post('/ajroutes', (req, res) => {
  var city = req.body.City
  var routename = req.body.RouteName

  stoplist[0].EstimateTime = parseInt(Math.random(0, 1)*100)

  res.render('routeBody', {
    city,
    routename,
    stoplist
  })
})

// TODO root page reserved maybe for member system
app.use('/', (req, res) => {
  res.status(404).send('not found')
})

app.listen(8888, () => {

})
