const request = require('request')

function Stop(StopName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(StopName),
            localUri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}?$filter=Stops%2Fany(d%3Ad%2FStopName%2FZh_tw%20eq%20'${Name}')&$format=JSON`,
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
            localUri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27&$%from=JSON`,
            Stops = []
        request({ uri: localUri },
            (err, res, data) => {
                if (err)
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
                                    'Lat': data[i]['Stops'][j]['StopPosition']['PositionLat'],
                                    'Lon': data[i]['Stops'][j]['StopPosition']['PositionLon']
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


function EstimatedTimeOfArrival(RouteName, City) {
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
                    resolve(Buses)
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
                                'Lat': data[i]['BusPosition']['PositionLat'],
                                'Lon': data[i]['BusPosition']['PositionLon'],
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


module.exports = {
    Stop,
    Route,
    EstimatedTimeOfArrival,
    RealTimeByFrequency,
}