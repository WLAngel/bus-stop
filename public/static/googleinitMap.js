


function initMap() {
    var map = new google.maps.Map(document.getElementById('map'))
    var station = data[0].Stops

    var lngs = station.map(function (e, i, a) { return e.Position.lng; });
    var lats = station.map(function (e, i, a) { return e.Position.lat; });
    console.log(lngs)
    map.fitBounds({
        west: Math.min.apply(null, lngs),
        east: Math.max.apply(null, lngs),
        north: Math.min.apply(null, lats),
        south: Math.max.apply(null, lats),
    });
    var MarkerObj = {}, InfoObj = {}, infowindow = {}
    var estimate = 0
    for (var i = 0, j = 0, position; i < station.length; i++) {

        position = { lat: station[i].Position.lat, lng: station[i].Position.lng }
        var stopname = station[i].StopName
        if (timedata[j].StopName === stopname) {
            estimate = new Date(timedata[j].SrcUpdateTime)
            estimate.setSeconds(estimate.getSeconds()+timedata[j].EstimateTime)
            estimate=estimate.toLocaleTimeString()
            j++
            infowindow[stopname] = new google.maps.InfoWindow({
                content: stopname + '<h5 class="infowindow">預估到站時間：' +estimate+ '</h5>'+'<h5 class="infowindow">到站順序'+station[i].StopSequence+'</h5>',
                maxWidth: 100,
                
            });
        }
        else {
            infowindow[stopname] = new google.maps.InfoWindow({
                content: stopname + '<h5 class="infowindow">已過站' + '</h5>'+'<h5 class="infowindow">到站順序'+station[i].StopSequence+'</h5>',

            });
        }

        MarkerObj[stopname] = new google.maps.Marker({
            position: position,
            map: map,
            title: station[i].StopName,
        })
        MarkerObj[stopname].info = infowindow[stopname]
        MarkerObj[stopname].addListener('click', function () {
            //alert("I am marker " + this.title); 
            this.info.open(map, this);
        })
        console.log(stopname, MarkerObj[stopname])
    }
    map.addListener('click', function () {

    })
    /*
    for (var i = 0, parts = [], max = 25 - 1; i < station.length; i = i + max)
        parts.push(station.slice(i, i + max + 1));
 
    var service_callback = function (response, status) {
        if (status != 'OK') {
            console.log('Directions request failed due to ' + status);
            return;
        }
        var renderer = new google.maps.DirectionsRenderer;
        renderer.setMap(map);
        renderer.setOptions({ suppressMarkers: true, preserveViewport: true });
        renderer.setDirections(response);
    };
    for (var i = 0; i < parts.length; i++) {
        
        var waypoints = [];
        for (var j = 1; j < parts[i].length - 1; j++)
            waypoints.push({ location: parts[i][j].Position, stopover: false });
        
        var service_options = {
            origin: parts[i][0].Position,
            destination: parts[i][parts[i].length - 1].Position,
            waypoints: waypoints,
            travelMode: 'WALKING'
        };
        
        directionsService.route(service_options, service_callback);
    }*/



}







