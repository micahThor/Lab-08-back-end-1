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
app.get('/', (request,response) => {
  const SQL = 'SELECT * FROM locations;';
  client.query(SQL).then(sqlResponse => {
    // console.log('sqlResponse :', sqlResponse);
    response.send(sqlResponse.rows);
  });
});

app.get('/location', getLocation);

app.get('/weather', getWeather);

app.get('/events', getEventBrite);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

function Location(city, geoData){
  this.search_query = city;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

// Route Handler
function getLocation(request,response) {
  console.log('!!!!!!!!!!!!!!!getLocation');
  const locationHandler = {
    query: request.query.data,
    cacheHit: (results) => {
      console.log('******Got data from SQL');
      response.send(results.rows[0]);
    },
    cacheMiss: () => {
      Location.fetchLocation(request.query.data)
        .then(data => response.send(data));
    },
  };
  console.log('*********locationHandler :', locationHandler);
  Location.lookupLocation(locationHandler);
}

// Lookup a location in the DB and invoke the proper callback methods based on what you find
Location.lookupLocation = (handler) => {
  console.log('!!!!!!!!!!!!!!!lookupLocation');
  const SQL = `SELECT * FROM locations WHERE search_query=$1`;
  const values = [handler.query];

  return client.query( SQL, values )
    .then( results => {
      if( results.rowCount > 0 ) {
        handler.cacheHit(results);
      }
      else {
        handler.cacheMiss();
      }
    })
    .catch( console.error );

};

// Save a location to the DB
Location.prototype.save = function() {
  console.log('!!!!!!!!!!!!!!!SAVE LOCATION TO Q');
  let SQL = `
    INSERT INTO locations
      (search_query,formatted_query,latitude,longitude) 
      VALUES($1,$2,$3,$4) 
      RETURNING id
  `;
  let values = Object.values(this);
  return client.query(SQL,values);
};



Location.fetchLocation = (query) => {
  console.log('!!!!!!!!!!!!!!!fetchLocation');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url).then(data => {
    let location = new Location(query, data.body.results[0]);
    console.log('******location :', location);
    return location.save().then(
      result => {
        location.id = result.rows[0].id;
        return location;
      }
    )
  })
}











function Weather(forecast, time){
  this.forecast = forecast;
  this.time = time;
}

function Event(link, name, event_date, summary){
  this.link = link;
  this.name = name;
  this.event_date = event_date;
  this.summary = summary;
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(url).then(data => {
    // console.log('WeatherDATA : ', data.body.daily.data);
    const weatherData = data.body.daily.data.map(obj => {
      let forecast = obj.summary;
      let formattedTime = new Date(obj.time * 1000).toDateString();
      return new Weather(forecast, formattedTime);
    })
    response.status(200).send(weatherData);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  });
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


