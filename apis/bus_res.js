
// MOTC API:
// http://ptx.transportdata.tw/MOTC#!/CityBusApi/

module.exports = {
  route: route,
  stop: stop,
}

function route(City, RouteName) {
  // TODO go query MOTC api http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/
  // and return stops of the RouteName's route

  return undefined
}

function stop(City, StopName) {
  // TODO go query MOTC api http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/
  // and return all the routes passing through this stop

  return undefined
}
