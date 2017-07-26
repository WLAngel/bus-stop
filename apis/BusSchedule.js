var request = require('request');

function BusSchedule(RouteName, City, Direction, Day) {
    RouteName = encodeURI(RouteName)
    return new Promise(function (resolve, reject) {
        let url = 'http://ptx.transportdata.tw/MOTC/v2/Bus/Schedule/City/' + City + '/' + RouteName + '?$format=JSON'
        console.log(url)
        request(url, function (err, res, body) {
            if (err) {
                console.log('error:', err);
            }
            else {
                var Schedule
                console.log('statusCode:', res && res.statusCode);
                if (!body)
                    return []
                body = JSON.parse(body)
                if (body.length > 2) {
                    let SubRoute = body.map((e, i, a) => e.SubRouteID).filter((e, i, a) => a.indexOf(e) !== i || a.lastIndexOf(e) !== i)
                    body = body.filter((e) => e.SubRouteID === SubRoute[0])
                }
                body = body.filter((e) => e.Direction === Direction)
                body = body[0]
                if (body.Timetables) {
                    var day = body.Timetables.filter((e) => e.ServiceDay[Day]).map(function (e) {
                        return {
                            StopName: e.StopTimes[0].StopName.Zh_tw,
                            DepartureTime: e.StopTimes[0].DepartureTime
                        }
                    }
                    )
                    //console.log(day)
                     Schedule = {
                        RouteName: body.RouteName.Zh_tw,
                        Direction: Direction,
                        TimeTable: day
                    }
                } else {
                    day = body.Frequencys.filter((e) => e.ServiceDay[Day]).map(function (e) {
                        return {
                            StartTime: e.StartTime,
                            EndTime: e.EndTime,
                            MinHeadwayMins: e.MinHeadwayMins,
                            MaxHeadwayMins: e.MaxHeadwayMins,
                        }

                    })
                    //console.log(day)
                     Schedule = {
                        RouteName: body.RouteName.Zh_tw,
                        Direction: Direction,
                        Frequencys:day
                    }
                }
                resolve(Schedule)
            }
        })
    })

}
//BusSchedule('307', 'Taipei', 0, 'Monday').then(data=>console.log(data))
