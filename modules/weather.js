'use strict';

const superagent = require('superagent');

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000).toDateString();
}

function getWeather(request, response) {
  superagent.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`).then(res => {

    let dailyData = res.body.daily.data;

    let nextForecast = dailyData.map((val, index, array) => {
      let nextForeCastObj = new Weather(val);
      return nextForeCastObj;
    });
    response.send(nextForecast);
  });
};

exports.getWeather = getWeather;