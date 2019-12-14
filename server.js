'use strict';

// server dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// local module dependencies
const trails = require('./modules/trail');
const movies = require('./modules/movies');
const yelp = require('./modules/yelp');
const events = require('./modules/event');
const weather = require('./modules/weather');
const locations = require('./modules/locations');

// API routes
app.get('/location', locations.getLocation);
app.get('/weather', weather.getWeather);
app.get('/events', events.getEventBrite);
app.get('/yelp', yelp.getYelp);
app.get('/movies', movies.getMovies);
app.get('/trails', trails.getTrails)

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
