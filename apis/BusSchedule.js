var request = require('request');

function BusSchedule(RouteName, City, Direction, Day, SubRouteUID) {
    RouteName = encodeURI(RouteName)
    return new Promise(function (resolve, reject) {
        let url = `http://ptx.transportdata.tw/MOTC/v2/Bus/Schedule/City/${City}/${RouteName}?$filter=RouteName%2FZh_tw%20eq%20%27${RouteName}%27&$format=JSON`
        request(url, function (err, res, body) {
            if (err) {
                console.log('error:', err);
            }
            else {
                var Schedule
                if (!body)
                    return []
                body = JSON.parse(body)
                if(body.length === 0) {
                  return resolve({})
                }
                if (body.length > 2) {
                    // let SubRoute = body.map((e, i, a) => e.SubRouteID).filter((e, i, a) => a.indexOf(e) !== i || a.lastIndexOf(e) !== i)
                    // body = body.filter((e) => e.SubRouteID === SubRoute[0])
                    body = body.filter(x => x.SubRouteUID === SubRouteUID)
                }
                body = body.filter((e) => e.Direction === Direction)
                body = body[0]

                Schedule = {
                   RouteName: body.RouteName.Zh_tw,
                   Direction: Direction,
                }

                if (body.Timetables) {
                    var day = body.Timetables.filter((e) => e.ServiceDay ? e.ServiceDay[Day] : e.SpecialDays).map(function (e) {
                        return {
                            StopName: e.StopTimes[0].StopName.Zh_tw,
                            DepartureTime: e.StopTimes[0].DepartureTime,
                            StopSequence: e.StopTimes[0].StopSequence
                        }
                    }
                    )
                     Schedule.TimeTable = day


                    Schedule.TimeTable.sort((x, y) => {
                      a = x.DepartureTime.split(':')
                      b = y.DepartureTime.split(':')
                      return (Number(a[0])*100 + Number(a[1])) -
                        (Number(b[0])*100 + Number(b[1]))
                    })
                }
                if (body.Frequencys) {
                    day = body.Frequencys.filter((e) => e.ServiceDay[Day]).map(function (e) {
                        return {
                            StartTime: e.StartTime,
                            EndTime: e.EndTime,
                            MinHeadwayMins: e.MinHeadwayMins,
                            MaxHeadwayMins: e.MaxHeadwayMins,
                        }

                    })
                    Schedule.Frequencys = day

                    Schedule.Frequencys.sort((x, y) => {
                      a = x.StartTime.split(':')
                      b = y.StartTime.split(':')
                      return (Number(a[0])*100 + Number(a[1])) -
                        (Number(b[0])*100 + Number(b[1]))
                    })
                }
                resolve(Schedule)
            }
        })
    })
}

module.exports = {
  BusSchedule
}
