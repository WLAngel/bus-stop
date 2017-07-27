const request = require('request')
const cheerio = require('cheerio')
const CityID = require('./../public/static/CityID.json')

function Weather(City, District) {
  return new Promise((resolve, reject) => {
    let ID = CityID[City][District]
    let uri = `http://www.cwb.gov.tw/m/f/town368/${ID}.php`
    let weather = []
    request(uri, (err, res, body) => {

      let $ = cheerio.load(body)

      $('#retab1 tbody tr').each(function (i, element) {
        weather.push($(this).text().replace(/\t/g, '').split('\n').filter(x => x !== ''))
        if (weather[i].length !== 7)
          weather[i].splice(3, 2, weather[i - 1][4])
        else
          weather[i].splice(4, 2)
        weather[i].splice(1, 0, $('img', this).attr('title'))
        weather[i][0] += ':00'
        weather[i][2] = weather[i][2].split(' ').join('')
        weather[i][3] = weather[i][3].split(' ').join('')
      })

      for (let i = 0; i < weather.length; i++) {
        weather[i] = {
          'Time': weather[i][0],
          'Condition': weather[i][1],
          'Temperature': weather[i][2],
          'FeelTemp': weather[i][3],
          'Humidity': weather[i][4],
          'RainProb': weather[i][5],
        }
      }
      weather = {
        District,
        weather
      }
      resolve(weather)
    })
  })
}

function Position(lat, lng) {
  return new Promise((resolve, reject) => {
    let uri = `http://maps.google.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-TW&sensor=true`

    request(uri, (err, res, body) => {
      body = JSON.parse(body)
      let City, District
      for (let i = 0; i < body.results[0].address_components.length; i++) {
        if (body.results[0].address_components[i].types[0] === 'administrative_area_level_1')
          City = body.results[0].address_components[i].short_name
        else if (body.results[0].address_components[i].types[0] === 'administrative_area_level_3')
          District = body.results[0].address_components[i].short_name
      }
      resolve({ 'City': City.replace('台', '臺'), 'District': District.replace('台', '臺') })
    })
  })
}

/*function predict(lat, lng, District) {
  return new Promise((resolve, reject) => {
    Position(lat, lng).then(x => {
      if (District[x[1]])
        resolve(x[1])
      Weather(x[0], x[1]).then(y => resolve(y))
    })
  })
}*/
function predict(lat, lng, obj) {
  return new Promise((resolve, reject) => {
    let check = {}
    Position(lat, lng).then(x => {
      if (check[x.District])
        resolve(check.weather)
      Weather(x.City, x.District).then(function (y) {
        console.log(y)
        obj['predict'] = y
        check[x.District] = y
        resolve()
      })

    })
  })
}
//var aaa = { aaa: 'aaa' }
//predict(25.0322875976563, 121.488914489746, aaa).then(() => console.log(aaa))

module.exports = {
  predict,
}
/*
const request = require('request')
const cheerio = require('cheerio')
const CityID = require('./../public/static/CityID.json')

function Weather(City, District) {
  return new Promise((resolve, reject) => {
    let ID = CityID[City][District]
    let uri = `http://www.cwb.gov.tw/m/f/town368/${ID}.php`
    let weather = []
    request(uri, (err, res, body) => {

      let $ = cheerio.load(body)

      $('#retab1 tbody tr').each(function (i, element) {
        weather.push($(this).text().replace(/\t/g, '').split('\n').filter(x => x !== ''))
        if (weather[i].length !== 7)
          weather[i].splice(3, 2, weather[i - 1][4])
        else
          weather[i].splice(4, 2)
        weather[i].splice(1, 0, $('img', this).attr('title'))
        weather[i][0] += ':00'
        weather[i][2] = weather[i][2].split(' ').join('')
        weather[i][3] = weather[i][3].split(' ').join('')
      })

      for (let i = 0; i < weather.length; i++) {
        weather[i] = {
          'Time': weather[i][0],
          'Condition': weather[i][1],
          'Temperature': weather[i][2],
          'FeelTemp': weather[i][3],
          'Humidity': weather[i][4],
          'RainProb': weather[i][5],
        }
      }
      resolve(weather)
    })
  })
}

function Position(lat, lng) {
  return new Promise((resolve, reject) => {
    let uri = `http://maps.google.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-TW&sensor=true`

    request(uri, (err, res, body) => {
      body = JSON.parse(body)
      let City, District
      for (let i = 0; i < body.results[0].address_components.length; i++) {
        if (body.results[0].address_components[i].types[0] === 'administrative_area_level_1')
          City = body.results[0].address_components[i].short_name
        else if (body.results[0].address_components[i].types[0] === 'administrative_area_level_3')
          District = body.results[0].address_components[i].short_name
      }
      resolve({ 'City': City.replace('台', '臺'), 'District': District.replace('台', '臺') })
    })
  })
}

function predict(array) {
  return new Promise((resolve, reject) => {
    let promises = [], check = {}
    for (let i = 0; i < array.length; i++)
      promises[i] = Position(array[i].Position.lat, array[i].Position.lng).then(x => array[i]['City'] = x)
    Promise.all(promises).then(() => {
      promises = []
      for (let i = 0; i < array.length; i++) {
        if (check[array[i].City.District])
          array[i]['Weather'] = check[array[i].City.District]
        else
          promises[i] = Weather(array[i].City.City, array[i].City.District).then(x => {
            array[i]['Weather'] = x
            check[array[i].City.District] = x
          })
      }
      Promise.all(promises).then(() => resolve())
    })
  })

  // [
  //   {
  //     Time: 'HH:MM', // until today ends
  //     Condition: string,
  //     Temperature: number(degree C),
  //     FeelTemp: number(degree C),
  //     Humidity: N %,
  //     RainProb: N %
  // }
  // ]
}

module.exports = {
  predict,
}
*/
