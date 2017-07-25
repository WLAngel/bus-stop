var request = require('request');
var information = require('./information.js')
//var googleinitMap = require('googleinitMap.js')
var express = require('express');
var app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));


information.Stop("電子公司", "NewTaipei").then(data => console.log(data))
//information.Route('793', 'NewTaipei').then(data => console.log(data[0]))

//information.EstimatedTimeOfArrival('793', 'NewTaipei').then(data => {console.log(data)})
app.get('/', function (req, res) {
    var KEY = 'AIzaSyCCDXOuy6JUbrfl6qLKNCXagS1ywRVg5hw'
    var googleMapUrl = "https://maps.googleapis.com/maps/api/js?key=" + KEY + "&callback=initMap"
    console.log('pass first ')
    information.Route('793', 'NewTaipei').then(function (data) {
        information.EstimatedTimeOfArrival('793', 'NewTaipei').then(function (timedata) {
            information.Stop('電子公司', "NewTaipei").then(function (stopdata) {
                console.log('hi')
                
                res.render('index', {
                    stopdata:stopdata,
                    data: JSON.stringify(data),
                    timedata: JSON.stringify(timedata),
                })
            })
        })
    })
})



app.listen(3000, function () {
    console.log('port 3000 listening...');
})