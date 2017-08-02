function initMap() {
    var map = new google.maps.Map(document.getElementById('map'))
    var station = data[0].Stops

    var lngs = station.map(function (e, i, a) { return e.Position.lng; });
    var lats = station.map(function (e, i, a) { return e.Position.lat; });
    map.fitBounds({
        west: Math.min.apply(null, lngs),
        east: Math.max.apply(null, lngs),
        north: Math.min.apply(null, lats),
        south: Math.max.apply(null, lats),
    });
    var MarkerObj = {}, infowindow = {}
    var estimate = 0

    for (var i = 0, j = 0, position; i < station.length; i++) {

        position = { lat: station[i].Position.lat, lng: station[i].Position.lng }
        var stopname = station[i].StopName
        if (station[i].predict) {
            if (station[i].predict.weather.length > 1) {
                infowindow[stopname] = new google.maps.InfoWindow({
                    content: `<div style="margin:0"><h4>站名：${stopname}<h4>
              </div><div>時間：${station[i].predict.weather[0].Time}</div><div>天氣:${station[i].predict.weather[0].Condition}</div><div>溫度:${station[i].predict.weather[0].Temperature}</div><div>體感溫度:${station[i].predict.weather[0].FeelTemp}</div><div>濕度:${station[i].predict.weather[0].Humidity}</div><div>降雨機率:${station[i].predict.weather[0].RainProb}</div><HR>
              </div><div>時間：${station[i].predict.weather[1].Time}</div><div>天氣:${station[i].predict.weather[1].Condition}</div><div>溫度:${station[i].predict.weather[1].Temperature}</div><div>體感溫度:${station[i].predict.weather[1].FeelTemp}</div><div>濕度:${station[i].predict.weather[1].Humidity}</div><div>降雨機率:${station[i].predict.weather[1].RainProb}</div>`
                })
            } else {
                infowindow[stopname] = new google.maps.InfoWindow({
                    content: `<div style="margin:0"><h4>站名：${stopname}<h4>
              </div><div>時間：${station[i].predict.weather[0].Time}</div><div>天氣:${station[i].predict.weather[0].Condition}</div><div>溫度:${station[i].predict.weather[0].Temperature}</div><div>體感溫度:${station[i].predict.weather[0].FeelTemp}</div><div>濕度:${station[i].predict.weather[0].Humidity}</div><div>降雨機率:${station[i].predict.weather[0].RainProb}</div><HR>`

                })
            }
        }
        else {
            infowindow[stopname] = new google.maps.InfoWindow({
                content: `<div style="margin:0"><h4>站名：${stopname}<h4>`
            })
        }
        MarkerObj[stopname] = new google.maps.Marker({
            position: position,
            map: map,
            title: station[i].StopName,
            icon: icon,
            stay: false
        })
        MarkerObj[stopname].info = infowindow[stopname]
        // MarkerObj[stopname][stay] = fales
        MarkerObj[stopname].addListener('mouseover', function () {
            this.info.open(map, this);
        })
        MarkerObj[stopname].addListener('mouseout', function () {
            if (this.stay === false)
                this.info.close(map, this);

        })
        MarkerObj[stopname].addListener('click', function () {

            if (this.stay === false) {
                this.stay = true

            }
            else {
                this.stay = false
                this.info.close(map, this);
            }
            this.info.open(map, this);

        })

    }
    map.addListener('click', function () {
    })
    bus = new google.maps.Marker({
        title: 'bus',
        map: map,
        icon:busicon,
    })
}
