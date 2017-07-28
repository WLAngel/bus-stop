const request = require('request')
const cheerio = require('cheerio')
const CityDistrictID = require('./../public/static/CityDistrictID.json')
const CityID = require('./../public/static/CityID.json')

function Weather(City, District) {
  return new Promise((resolve, reject) => {
    let ID = CityDistrictID[City][District]
    let uri = `http://www.cwb.gov.tw/m/f/town368/${ID}.php`
    let weather = []
    request(uri, (err, res, body) => {
      if (err)
        return reject(err)
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
    if (lat == 0 || lng == 0)
      return reject(`Lat or Lng err`)
    let uri = `https://maps.google.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-TW&sensor=true&key=AIzaSyCCDXOuy6JUbrfl6qLKNCXagS1ywRVg5hw`

    request(uri, (err, res, body) => {
      if (err)
        return reject(err)
      body = JSON.parse(body)
      if (body.status !== 'OK') {
        console.log(body)
        return reject(`status not OK`)
      }
      let City, District, re = false
      for (let j = 0; j < body.results.length; j++) {
        for (let i = 0; i < body.results[j].address_components.length; i++) {
          if (body.results[j].address_components[i].types[0] === 'administrative_area_level_1')
            City = body.results[j].address_components[i].short_name
          else if (body.results[j].address_components[i].types[0] === 'administrative_area_level_2')
            City = body.results[j].address_components[i].short_name
          else if (body.results[j].address_components[i].types[0] === 'administrative_area_level_3')
            District = body.results[j].address_components[i].short_name
          if (City && District && CityDistrictID[City.replace('台', '臺')]) {
            re = true
            break
          }
        }
        if (re)
          break
      }
      if (re)
        resolve({ 'City': City.replace('台', '臺'), 'District': District.replace('台', '臺') })
      else
        return reject(`Position err`)
    })
  })
}

function CityWeather(City) {
  return new Promise((resolve, reject) => {
    let ID = CityID[City]
    let uri = `http://www.cwb.gov.tw/m/f/taiwan/36/${ID}.htm`
    let weather = []
    request(uri, (err, res, body) => {
      if (err)
        return reject(`get Weather err`)
      else {
        let $ = cheerio.load(body)

        weather.push([$('.box-content p').eq(1).text()])
        weather.push([$('.box-content p').eq(3).text()])
        weather.push([$('.box-content p').eq(5).text()])
        let str = $('.table.table-bordered.table-36hr tbody tr').text().replace(/\t/g, '').split('\n')
        for (let i = 0; i < weather.length; i++) {
          while (str[0] !== '  ')
            weather[i].push(str.shift())
          weather[i] = weather[i].filter(x => x !== '')
          str.shift()
        }
        for (let i = 0; i < weather.length; i++) {
          weather[i] = {
            'Time': weather[i][0],
            'Condition': weather[i][2],
            'Temperature': weather[i][1],
            'FeelTemp': weather[i][3],
            'Humidity': `???%`,
            'RainProb': weather[i][4],
          }
        }
        weather = {
          'District': City,
          weather
        }

      }
      resolve(weather)
    })
  })
}

function predict(lat, lng, obj, check, City) {
  return new Promise((resolve, reject) => {
    Position(lat, lng).then(x => {
      if (check[x.District]) {
        obj['predict'] = check[x.District]
        resolve()
      }
      Weather(x.City, x.District).then(function (y) {
        obj['predict'] = y
        check[x.District] = y
        resolve()
      })
    }).catch(() => {
      obj['predict'] = {
        'District': '???',
        'weather': [{
          'Time': '???',
          'Condition': '???',
          'Temperature': '???',
          'FeelTemp': '???',
          'Humidity': '???',
          'RainProb': '???'
        }, {
          'Time': '???',
          'Condition': '???',
          'Temperature': '???',
          'FeelTemp': '???',
          'Humidity': '???',
          'RainProb': '???'
        }]
      }
      resolve()
    })
  })
}


module.exports = {
  predict,
}