'use strict';

const superagent = require('superagent');

// Creates a trail with state readable by front-end app
function Trail(trailData) {

  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.url;
  this.conditions = trailData.conditionStatus;
  this.conditions_date = trailData.conditionDate;
  this.conditions_time = trailData.conditionDetails;
}

// Takes user's location input and sends an array of trail data to front-end app
function getTrails(request, response) {

  // API endpoint -- Uses coordinates supplied from user's input
  const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&key=${process.env.TRAIL_API_KEY}`;

  // Process data from endpoint request and create array of Trail objects.  Sends that array to front-end app
  superagent.get(url).then(dataFromEndpoint => {

    let trailArray = dataFromEndpoint.body.trails;

    let trailDataToServer = trailArray.map(trailData => new Trail(trailData));

    response.send(trailDataToServer);
  });
}

exports.getTrails = getTrails;