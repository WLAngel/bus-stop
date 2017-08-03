const pwd = process.env.PASSWORD
module.exports = {
  pwd
}

var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyparser = require('body-parser')

var router = require('./routes/router.js')

var app = express()

app.set('views', path.join(__dirname, 'public', 'views'))
app.set('view engine', 'pug')

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.post('/routes', router.routes)

app.post('/stops', router.stops)

app.get('/bus', router.bus)

app.post('/ajbus', router.ajbus)

app.post('/ajroutes', router.ajroutes)

app.use('/', (req, res) => {
  res.status(404).send('not found')
})

app.listen(8888, () => {
  console.log('server up on port 8888')
})
