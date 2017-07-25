var express = require('express')
var path = require('path')
var bodyparser = require('body-parser')

var bus = require('./apis/information.js')
var c = require('./public/static/city.js')

var app = express()

app.set('views', path.join(__dirname, 'public', 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

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
      if(routelist[0].Direction == direction)
        var Stops = routelist[0].Stops
      else
        var Stops = routelist[1].Stops

      var count = 0
      if(est.length) {
        for(var i = 0; i < Stops.length; i++) {
          if(est[count].StopName === Stops[i].StopName) {
            Stops[i].EstimateTime = est[count].EstimateTime
            count++
          }
        }
      }
      res.render('routeBody', {
        Stops
      })
    })
  })

})

app.use('/', (req, res) => {
  res.status(404).send('not found')
})

app.listen(8888, () => {

})
