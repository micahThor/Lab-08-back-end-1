'use strict';

const superagent = require('superagent');

// Creates a weather with state readable by front-end app
function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000).toDateString();
}

// Takes user's location input and sends an array of trail data to front-end app
function getWeather(request, response) {

  // API endpoint -- Uses coordinates supplied from user's input
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  // Process data from endpoint request and create array of Trail objects.  Sends that array to front-end app
  superagent.get(url).then(res => {

    let dailyDataArray = res.body.daily.data;

    let nextForecast = dailyDataArray.map((dataFromEndPoint ) => new Weather(dataFromEndPoint));

    response.send(nextForecast);
  });
}; 

exports.getWeather = getWeather;