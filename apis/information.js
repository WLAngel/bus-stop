const request = require('request')

function Stop(StopName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(StopName),
            localUri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}?$filter=Stops%2Fany(d%3Ad%2FStopName%2FZh_tw%20eq%20'${Name}')%20and%20KeyPattern%20eq%20true%20&$format=JSON`,
            Route = []
        request({ uri: localUri },
            (err, res, data) => {
                if (err)
                    reject(err)
                else {
                    data = JSON.parse(data)
                    for (let i = 0; i < data.length; i++) {
                        Route.push(data[i]['RouteName']['Zh_tw'])
                    }
                    resolve(Route.filter((val, i, arr) => arr.indexOf(val) === i).sort())
                }
            })
    })
}


function Route(RouteName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(RouteName),
            localUri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27%20and%20KeyPattern%20eq%20true%20&$format=JSON`,
            Stops = []
        request({ uri: localUri },
            (err, res, data) => {
                if (err || res.statusCode !== 200)
                    reject(err)
                else {
                    data = JSON.parse(data)
                    for (let i = 0; i < data.length; i++) {
                        Stops.push({
                            'RouteName': data[i]['RouteName']['Zh_tw'],
                            'Direction': data[i]["Direction"]
                        })
                        Stops[i]['Stops'] = []
                        for (let j = 0; j < data[i]['Stops'].length; j++) {
                            Stops[i]['Stops'][j] = {
                                'StopName': data[i]['Stops'][j]['StopName']['Zh_tw'],
                                'StopSequence': data[i]['Stops'][j]['StopSequence'],
                                'Position': {
                                    'lat': data[i]['Stops'][j]['StopPosition']['PositionLat'],
                                    'lng': data[i]['Stops'][j]['StopPosition']['PositionLon']
                                }
                            }
                        }
                        Stops[i]['UpdateTime'] = data[i]['UpdateTime']
                    }
                    resolve(Stops)
                }
            })
    })
}


function EstimatedTimeOfArrival(RouteName, City, Direction) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(RouteName),
            localUri = `http://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27&$%from=JSON`,
            Buses = []
        request({ uri: localUri },
            (err, res, data) => {
                if (err)
                    reject(err)
                else {
                    data = JSON.parse(data)
                    for (let i = 0; i < data.length; i++) {
                        Buses.push({
                            'StopName': data[i]['StopName']['Zh_tw'],
                            'RouteName': data[i]['RouteName']['Zh_tw'],
                            'Direction': data[i]['Direction'],
                            'EstimateTime': data[i]['EstimateTime'],
                            'SrcUpdateTime': data[i]['SrcUpdateTime'],
                            'UpdateTime': data[i]['UpdateTime'],
                            'StopSequence': data[i]['StopSequence'],
                        })
                    }
                    resolve(Buses.filter(x => x.Direction == Direction).sort((x, y) => x.StopSequence - y.StopSequence))
                }
            })
    })
}


function RealTimeByFrequency(RouteName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(RouteName),
            localUri = `http://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27&$%from=JSON`,
            Buses = []
        request({ uri: localUri },
            (err, res, data) => {
                if (err)
                    reject(err)
                else {
                    data = JSON.parse(data)
                    for (let i = 0; i < data.length; i++) {
                        Buses.push({
                            'PlateNumb': data[i]['PlateNumb'],
                            'RouteName': data[i]['RouteName']['Zh_tw'],
                            'Direction': data[i]['Direction'],
                            'BusStatus': data[i]['BusStatus'],
                            'BusPosition': {
                                'lat': data[i]['BusPosition']['PositionLat'],
                                'lng': data[i]['BusPosition']['PositionLon'],
                            },
                            'SrcUpdateTime': data[i]['SrcUpdateTime'],
                            'UpdateTime': data[i]['UpdateTime'],
                        })
                    }
                    resolve(Buses)
                }
            })
    })
}

function Schedule(RouteName, City, Direction, Day) {

  // return Schedule = {
  //   RouteName (NameType): 路線名稱,
  //   Direction (string): 去返程 = ['0: 去程', '1: 返程'],
  //   (Timetables or Frequencys)
  // }
  // TimeTables: [
  //     {
  //         StopName (NameType): 站牌名稱,
  //         DepartureTime (string): 離站時間，格式為:HH:mm
  //     },
  // ]
  //
  // Frequencys: [
  //     {
  //         StartTime (string): 發車班距起始適用時間，格式為: HH:mm ,
  //         EndTime (string): 發車班距結束適用時間，格式為: HH:mm ,
  //         MinHeadwayMins (integer): 最小班距時間(分鐘) ,
  //         MaxHeadwayMins (integer): 最大班距時間(分鐘) ,
  //     },
  // ]

}


module.exports = {
    Stop,
    Route,
    EstimatedTimeOfArrival,
    RealTimeByFrequency,
    Schedule
  }
