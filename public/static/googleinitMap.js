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

    for (var i = 0, j = 0, position; i < station.length; i++) {

        position = { lat: station[i].Position.lat, lng: station[i].Position.lng }
        var stopname = station[i].StopName
        infowindow[stopname] = new google.maps.InfoWindow({
            content: `<div style="margin:0"><h4>站名：${stopname}<h4>`
        })
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
}
