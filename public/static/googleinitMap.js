function initMap() {
    var map = new google.maps.Map(document.getElementById('map'))
    var station
    station = data[0].Stops

    var lngs = []
    var lats = []
    for (let i = 0; i < station.length; i++) {
        let position = station[i].Position
        let lat = position.lat
        let lng = position.lng
        if (lat === 0 || lng === 0)
            continue
        lats.push(lat)
        lngs.push(lng)
    }
    map.fitBounds({
        west: Math.min.apply(null, lngs),
        east: Math.max.apply(null, lngs),
        north: Math.min.apply(null, lats),
        south: Math.max.apply(null, lats),
    });
    function addMarker(station) {
        position = { lat: station.Position.lat, lng: station.Position.lng }
        infowindow[stopname] = new google.maps.InfoWindow({
            content: `<div style="margin:0"><h4>站名：${stopname}<h4>`
        })
        MarkerObj[stopname] = new google.maps.Marker({
            position: position,
            map: map,
            title: station.StopName,
            icon: icon,
            stay: false
        })

        MarkerObj[stopname].info = infowindow[stopname]
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
    for (var i = 0, position; i < station.length; i++) {
        var stopname = station[i].StopName
        addMarker(station[i])
    }
    station = data[1].Stops
    for (var i = 0, position; i < station.length; i++) {
        var stopname = station[i].StopName
        if (MarkerObj[stopname] === undefined) {
            addMarker(station[i])
        }
    }
}
