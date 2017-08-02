const request = require('request')
const cheerio = require('cheerio')
const CityDistrictID = require('./../public/static/CityDistrictID.json')
const CityID = require('./../public/static/CityID.json')
const mongo = require('./position.js')

function Weather(City, District) {
  return new Promise((resolve, reject) => {
    let ID = CityDistrictID[City][District]
    let uri = `http://www.cwb.gov.tw/m/f/town368/${ID}.php`
    let weather = []
    request(uri, (err, res, body) => {
      if (err)
        return reject(new Error(err))
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
          'Humidity': weather[i][5],
          'RainProb': weather[i][4],
        }
      }
      if (weather.length === 0)
        return reject(new Error(`get District Weather err`))
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
      return reject(new Error(`lat or lng err`))
    // let uri =`http://maps.google.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-TW&sensor=true`
    let uri = `https://maps.google.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-TW&sensor=true&key=AIzaSyAejJQ6H7CY4dCTKN3l2TusndspVEVXL-4`

    request(uri, (err, res, body) => {
      if (err)
        return reject(new Error(err))
      body = JSON.parse(body)
      if (body.status !== 'OK') {
        // console.log(body)
        return reject(new Error(body.error_message))
      }
      let City, District, re = false
      for (let j = 0; j < body.results.length; j++) {
        for (let i = 0; i < body.results[j].address_components.length; i++) {
          let area_level = body.results[j].address_components[i].types[0]
          let short_name = body.results[j].address_components[i].short_name.replace('台', '臺').replace('新北市', '臺北市')
          if (area_level === 'administrative_area_level_1')
            City = short_name
          else if (area_level === 'administrative_area_level_2')
            City = short_name
          else if (area_level === 'administrative_area_level_3')
            District = short_name
          if (City && District && CityDistrictID[City] && CityDistrictID[City][District]) {
            re = true
            break
          }
        }
        if (re)
          break
      }
      if (re)
        resolve({ City, District })
      else
        return reject(new Error(`Position err`))
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
        return reject(new Error(`get City Weather err`))
      else {
        let $ = cheerio.load(body)

        for (let i = 1; i <= 5; i += 2)
          weather.push([$('.box-content p').eq(i).text()])

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

function predict(StopList) {
  return new Promise((resolve, reject) => {
    let promises1 = [], promises2 = [], check = {}
    mongo.connect()
    for (let i = 0; i < StopList.Stops.length; i++) {
      let lat = StopList.Stops[i].Position.lat
      let lng = StopList.Stops[i].Position.lng
      promises1.push(mongo.lookup(lat, lng).then(x => {
        check[x.District] = x.City
        StopList.Stops[i]['City'] = x.City
        StopList.Stops[i]['District'] = x.District
      }).catch((err) => {
        if (err)
          console.error(err)
        promises2.push(Position(lat, lng).then(x => {
          check[x.District] = x.City
          StopList.Stops[i]['City'] = x.City
          StopList.Stops[i]['District'] = x.District
          mongo.store(lat, lng, x.City, x.District)
        }).catch(err => console.error(err)))
      }))
    }

    Promise.all(promises1).then(() => {
      Promise.all(promises2).then(() => {
        mongo.close()
        let promises = []
        for (let i in check) {
          promises.push(Weather(check[i], i).then(x => {
            for (let index = 0; index < StopList.Stops.length; index++) {
              if (StopList.Stops[index].District === i) {
                StopList.Stops[index]['predict'] = x
              }
            }
          }).catch(err => console.error(err)))
        }
        Promise.all(promises).then(() => resolve())
      })
    })
  })
}


module.exports = {
  predict,
}