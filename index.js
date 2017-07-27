var express = require('express')
var path = require('path')
var bodyparser = require('body-parser')

var bus = require('./apis/information.js')
var busSch = require('./apis/BusSchedule.js')
var weather = require('./apis/weather.js')
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
  var city = req.body.City
  var routename = req.body.RouteName

  bus.Route(routename, c.En[city]).catch(() => {
    return ''
  }).then(stoplist => {

    if(stoplist.filter(x => x.KeyPattern).length) {
      stoplist = stoplist.filter(x => x.KeyPattern)
    }
    else {
      let Dir = []
      Dir[0] = stoplist.filter(x => x.Direction === 0)
      Dir[1] = stoplist.filter(x => x.Direction === 1)
      Dir[0] = Dir[0].reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
      Dir[1] = Dir[1].reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
      stoplist = [Dir[0], Dir[1]]
    }
    if(stoplist.length === 0) {
      return res.status(404).send('Can\'t find such RouteName in the City, please try another ' +
        'City or check your input. <a href=\'/bus\'>返回</a>')
    }
      console.log(stoplist[0].Stops[0].Position)
    for (var promises = [], station, i = 0; i < stoplist[0].Stops.length; i++) {
      station = stoplist[0].Stops[i]
      promises[i] = weather.predict(station.Position.lat, station.Position.lng, station)
    }
    Promise.all(promises).then(function () {
      promises = []
      
      res.render('routes', {
        city,
        routename,
        stoplist,
      })
    })

    

  })
})

app.post('/stops', (req, res) => {
  // TODO error handling
  var city = req.body.City
  var stopname = req.body.StopName

  bus.Stop(stopname, c.En[city]).then(routelist => {
    if (routelist.length === 0) {
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

app.post('/ajbus', (req, res) => {
  var city = req.body.City

  bus.getRouteList(c.En[city]).then(routelist => {
    res.render('routeselect', {
      routelist
    })
  })
})

app.post('/ajroutes', (req, res) => {
  var city = req.body.City
  var routename = req.body.RouteName
  var direction = req.body.Direction

  bus.EstimatedTimeOfArrival(routename, c.En[city], direction).then(est => {
    bus.Route(routename, c.En[city]).then(routelist => {
      routelist = routelist.filter(x => x.Direction == direction)
      key = routelist.filter(x => x.KeyPattern === true)[0]
      sub = routelist.filter(x => x.KeyPattern === false).reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
      if(key === undefined)
        key = sub
      busSch.BusSchedule(routename, c.En[city], Number(direction), days[new Date().getDay()], sub.SubRouteName).then(schedule => {
        var Stops = key.Stops
        var estimate = {}
        for (var i = 0; i < est.length; i++) {
          estimate[est[i].StopName] = est[i].EstimateTime
        }

        if(schedule.TimeTable && schedule.TimeTable.length) {
          if(estimate[Stops[0].StopName] === undefined) {
            function nextBus(now) {
              var filt = schedule.TimeTable.filter(x => Number(x.DepartureTime.split(':')[0]) * 100 + Number(x.DepartureTime.split(':')[1]) >= now.getHours() * 100 + now.getMinutes())
              return filt[0]
            }
            var next = nextBus(new Date())
            estimate[next.StopName] = next.DepartureTime
          }
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
