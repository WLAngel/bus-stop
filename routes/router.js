var bodyparser = require('body-parser')
var cookieParser = require('cookie-parser')

var bus = require('../apis/information.js')
var busSch = require('../apis/BusSchedule.js')
var weather = require('../apis/weather.js')
var c = require('../public/static/city.js')

const days = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

exports.routes = (req, res) => {
  if (req.body.Record) {
    req.body.Record = JSON.parse(req.body.Record)
    var city = req.body.Record.City
    var routename = req.body.Record.RouteName
  } else {
    var city = req.body.City
    var routename = req.body.RouteName
  }

  bus.Route(routename, c.En[city]).catch(() => {
    return ''
  }).then(stoplist => {
    if (stoplist.filter(x => x.KeyPattern).length) {
      stoplist = stoplist.filter(x => x.KeyPattern)
    }
    else {
      let Dir = []
      Dir[0] = stoplist.filter(x => x.Direction === 0)
      Dir[1] = stoplist.filter(x => x.Direction === 1)
      stoplist = []
      if (Dir[0].length) {
        Dir[0] = Dir[0].reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
        stoplist.push(Dir[0])
      }
      if (Dir[1].length) {
        Dir[1] = Dir[1].reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
        stoplist.push(Dir[1])
      }
    }
    if (stoplist.length === 0) {
      return res.status(404).send('Can\'t find such RouteName in the City, please try another ' +
      'City or check your input. <a href=\'/bus\'>返回</a>')
    }
    if (!req.cookies.record) {
      res.cookie('record', [{ City: city, RouteName: routename }])
    } else {
      let record = req.cookies.record
      for (var repeat = false, i = 0; i < record.length; i++) {
        if (JSON.stringify({ City: city, RouteName: routename }) === JSON.stringify(record[i])) {
          repeat = true
          break
        }
      }
      if (!repeat) {
        if (record.length > 3) {
          record.shift()
        }
        record.push({ City: city, RouteName: routename })
        res.cookie('record', record)
      }
    }
    res.render('routes', {
      city,
      routename,
      stoplist,
    })
  })
}

exports.stops = (req, res) => {
  var city = req.body.City
  var stopname = req.body.StopName

  bus.Stop(stopname, c.En[city]).then(routelist => {
    if (routelist.length === 0) {
      return res.status(404).send('Can\'t find any RouteName in the City for the Stop, ' +
      'please try another City or check your input. <a href=\'/bus\'>返回</a>')
    }
    else {
      bus.getRouteList(c.En[city], routelist).then(ret => {
        ret = ret.map(x => {
          return {
            RouteName: x.split(' ')[0],
            Direction: x.split(' ')[1]
          }
        })
        res.render('stops', {
          city,
          stopname,
          routelist: ret
        })
      })
    }
  })
}

exports.bus = (req, res) => {
  var record = []
  if (req.cookies.record) {
    record = req.cookies.record
  }
  res.render('bus.pug', {
    record: record,
    cities: c.cities
  })
}

exports.ajbus = (req, res) => {
  var city = req.body.City

  bus.getRouteList(c.En[city]).then(routelist => {
    res.render('routeselect', {
      routelist
    })
  })
}

exports.ajweather = (req, res) => {
  var city = req.body.City
  var routename = req.body.RouteName

  bus.Route(routename, c.En[city]).catch(() => {
    return ''
  }).then(stoplist => {
    if (stoplist.filter(x => x.KeyPattern).length) {
      stoplist = stoplist.filter(x => x.KeyPattern)
    }
    else {
      let Dir = []
      Dir[0] = stoplist.filter(x => x.Direction === 0)
      stoplist = []
      if (Dir[0].length) {
        Dir[0] = Dir[0].reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
        stoplist.push(Dir[0])
      }
    }

    weather.predict(stoplist[0]).then(() => {
      res.send(stoplist[0])
    })
  })
}

exports.ajroutes = (req, res) => {
  var city = req.body.City
  var routename = req.body.RouteName
  var direction = req.body.Direction

  bus.EstimatedTimeOfArrival(routename, c.En[city], direction).then(est => {
    bus.Route(routename, c.En[city]).then(routelist => {
      routelist = routelist.filter(x => x.Direction == direction)
      key = routelist.filter(x => x.KeyPattern === true)[0]
      sub = routelist.filter(x => x.KeyPattern === false).reduce((max, cur) => max.Stops.length < cur.Stops.length ? cur : max)
      if (key === undefined)
      key = sub
      busSch.BusSchedule(routename, c.En[city], Number(direction), days[new Date().getDay()], sub.SubRouteUID).then(schedule => {
        var Stops = key.Stops
        var estimate = {}

        if (est.length) {
          est = est.filter(x => x.SubRouteUID === undefined ? true : x.SubRouteUID === sub.SubRouteUID)
          for (var i = 0; i < est.length; i++) {
            estimate[est[i].StopSequence] = est[i].EstimateTime < 0 ? undefined : est[i].EstimateTime
          }
          if (schedule.TimeTable && schedule.TimeTable.length) {
            if (estimate[Stops[0].StopSequence] === undefined) {
              function nextBus(now) {
                var filt = schedule.TimeTable.filter(x => Number(x.DepartureTime.split(':')[0]) * 100 + Number(x.DepartureTime.split(':')[1]) >= now.getHours() * 100 + now.getMinutes())
                return filt[0]
              }
              var next = nextBus(new Date())
              if (next)
              estimate[next.StopSequence] = next.DepartureTime
              else {
                estimate[est[0].StopSequence] = null
              }
            }
          }
          else
          schedule.TimeTable = undefined
        }
        else {
          for (var i = 0; i < Stops.length; i++) {
            estimate[Stops[i].StopSequence] = undefined
          }
        }
        var busPosition=[]
        for(var i in estimate) {
          if(estimate[i]!==undefined) {
            if(estimate[i]===0) {
              busPosition.push(Stops[String(Number(i)-1)])
            }
            else {
              if(estimate[String(Number(i)-1)]===undefined&&estimate[String(Number(i)+1)]>estimate[i]||
              estimate[String(Number(i)-1)]>estimate[i]&&estimate[String(Number(i)+1)]>estimate[i]||
              estimate[String(Number(i)-1)]===undefined&&estimate[String(Number(i)+1)]===undefined||
              estimate[String(Number(i)-1)]>estimate[i]&&estimate[String(Number(i)+1)]===undefined){

                busPosition.push(Stops[String(Number(i)-1)])
              }
            }
          }
        }
        StopsName=Stops.map((e)=>e.StopName)
        console.log(StopsName.length)
        res.render('routeBody', {
          StopsName,
          busPosition,
          Stops,
          estimate,
          schedule
        })
      })
    })
  })
}
