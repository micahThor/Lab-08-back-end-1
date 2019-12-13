'use strict';

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// Database set up
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));
client.connect();


// API routes
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/events', getEventBrite);
app.get('/yelp', getYelp);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

// Route Handler
function getLocation(request, response) {
  const tableName = 'locations';
  const fieldName = 'search_query';
  const locationHandler = {
    query: request.query.data,
    // if there is data existing
    cacheHit: (results) => {
      // console.log('results :', results);
      response.send(results.rows[0]);
    },
    // if there is no data existing
    cacheMiss: () => {
      fetchLocation(request.query.data)
        .then(data => response.send(data));
    },
  };
  checkDuplicate(locationHandler, tableName, fieldName);
}


function checkDuplicate(handler, tableName, fieldName) {
  const SQL = `SELECT * FROM ${tableName} WHERE ${fieldName}=$1`;
  const values = [handler.query];
  return client.query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        // if there is data existing
        handler.cacheHit(results);
      }
      else {
        // if there is no data existing
        handler.cacheMiss();
      }
    })
    .catch(console.error);
}


function fetchLocation(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url).then(data => {
    let location = new Location(query, data.body.results[0]);
    return location.saveDB().then(
      result => {
        location.id = result.rows[0].id;
        return location;
      }
    )
  })
}

// Save a location to the DB
Location.prototype.saveDB = function () {
  let SQL = `
    INSERT INTO locations
      (search_query,formatted_query,latitude,longitude) 
      VALUES($1,$2,$3,$4) 
      RETURNING id
  `;
  let values = Object.values(this);
  return client.query(SQL, values);
};


// ******** WEATHER **********

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time  * 1000).toDateString();
}

function getWeather(request, response) {
  superagent.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`).then(res => {
    
    let dailyData = res.body.daily.data;
    
    let nextForecast = dailyData.map( (val, index, array) => {
      let nextForeCastObj = new Weather(val);
      return nextForeCastObj;
    });
    response.send(nextForecast);
  });
};

/* 

function fetchWeather(query) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${query.latitude},${query.longitude}`;
  superagent.get(url).then(weatherdata => {
    
    let data = weatherdata.body.daily.data.forEach( val => {
      
      let nextWeatherData = new Weather(val);
      console.log(nextWeatherData);
    });
    response.status(200).send(data);
  });
} */






// ******** EVENT **********

function Event(link, name, event_date, summary) {
  this.link = link;
  this.name = name;
  this.event_date = event_date;
  this.summary = summary;
}


function getEventBrite(request, response) {
  const url = `http://api.eventful.com/json/events/search?location=${request.query.data.formatted_query}&app_key=${process.env.EVENTBRITE_API_KEY}`;
  superagent.get(url).then(data => {
    const parsedData = JSON.parse(data.text);
    const eventData = parsedData.events.event.map(data => {
      const link = data.url;
      const name = data.title;
      const event_date = new Date(data.start_time).toDateString();
      const summary = data.description;
      return new Event(link, name, event_date, summary);
    })
    response.status(200).send(eventData);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  })  
}

function yelpRestaurant(name, img, price, rating, url) {
  this.name = name;
  this.image_url = img;
  this.price = price;
  this.rating = rating;
  this.url = url;
}


function getYelp(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?term="restaurants"&location="${request.query.data.formatted_query}"`;
  
  superagent.get(url).set('Authorization', 'BEARER vovF9nM3NY1B2vvynkDkJvJona07uQk5t---0cZ5nRZGSx754R2LzJnOzHn25u2N31xiBioHBe7QV8fB5ybwmPIRWUX2OLaRoDGcJZnkZlID8cOf_oXVumCRLMrzXXYx').then(data => {

    const yelpJSON = JSON.parse(data.text);
    const restaurantArray = yelpJSON.businesses;

    const restaurantData = restaurantArray.map( value => {

      let restaurantName = value.name;
      let restaurantImg = value.image_url;
      let restaurantPrice = value.price;
      let restaurantRating = value.rating;
      let restaurantURL = value.url;
      
      let nextRestaurant = new yelpRestaurant(restaurantName, restaurantImg, restaurantPrice, restaurantRating, restaurantURL);
      return nextRestaurant;
    });
    
    response.status(200).send(restaurantData);
  }).catch(err => {
    //console.error(err);
    //response.status(500).send('Status 500: Internal Server Error');
  })
}


