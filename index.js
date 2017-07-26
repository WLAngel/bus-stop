var express = require('express')
var path = require('path')
var bodyparser = require('body-parser')

var bus = require('./apis/information.js')
var busSch = require('./apis/BusSchedule.js')
var c = require('./public/static/city.js')

var app = express()

app.set('views', path.join(__dirname, 'public', 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

const days = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

app.post('/routes', (req, res) => {
  // TODO error handling
  var city = req.body.City
  var routename = req.body.RouteName

  bus.Route(routename, c.En[city]).catch(() => {
    return ''
  }).then(stoplist => {
    if(stoplist.length === 0) {
      return res.status(404).send('Can\'t find such RouteName in the City, please try another ' +
      'City or check your input. <a href=\'/bus\'>返回</a>')
    }
    res.render('routes', {
      city,
      routename,
      stoplist,
    })
  })
})

app.post('/stops', (req, res) => {
  // TODO error handling
  var city = req.body.City
  var stopname = req.body.StopName

  bus.Stop(stopname, c.En[city]).then(routelist => {
    if(routelist.length === 0) {
      return res.status(404).send('Can\'t find any RouteName in the City for the Stop, ' +
      'please try another City or check your input. <a href=\'/bus\'>返回</a>')
    }
    res.render('stops', {
      city,
      stopname,
      routelist
    })
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
  var direction = req.body.Direction

  bus.EstimatedTimeOfArrival(routename, c.En[city], direction).catch(console.error).then(est => {
    bus.Route(routename, c.En[city]).then(routelist => {
      busSch.BusSchedule(routename, c.En[city], Number(direction), days[new Date().getDay()]).then(schedule => {
        
        if(routelist[0].Direction == direction)
          var Stops = routelist[0].Stops
        else
          var Stops = routelist[1].Stops

        var estimate = {}
        for(var i = 0; i < est.length; i++) {
          estimate[est[i].StopName] = est[i].EstimateTime
        }
        if(Stops[0].EstimateTime === undefined) {

        }
        res.render('routeBody', {
          Stops,
          estimate,
          schedule
        })
      })
    })
  })
})

app.use('/', (req, res) => {
  res.status(404).send('not found')
})

app.listen(8888, () => {
  console.log('server up on port 8888')
})
