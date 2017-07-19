const express = require('express')


var app = express();

app.get('/routes', (req, res) => {
  // TODO should return routes of bus

  res.send('should return routes of bus')
})
app.get('/stops', (req, res) => {
  // TODO should return RouteName of bus in a specific StopName

  res.send('should return RouteName of bus in a specific StopName')
})

app.get('/util', (req, res) => {
  // TODO should show utilities

  res.send('should show utility options for user to play with')
})

// TODO root page reserved
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(8888, function () {
  console.log('Example app listening on port 8888!');
});
