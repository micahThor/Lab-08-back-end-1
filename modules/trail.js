'use strict';

const superagent = require('superagent');

function Trail(name, locationName, length, stars, votes, summary, url, conditions, conditions_date, condition_time) {
  this.name = name;
  this.location = locationName;
  this.length = length;
  this.stars = stars;
  this.star_votes = votes;
  this.summary = summary;
  this.trail_url = url;
  this.conditions = conditions;
  this.conditions_date = conditions_date;
  this.conditions_time = condition_time;

}

function getTrails(request, response) {

  const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&key=${process.env.
    TRAIL_API_KEY}`;

  superagent.get(url).then(data => {

    let trailArray = data.body.trails;

    let trailData = trailArray.map(value => {
      
      let name = value.name;
      let location = value.location;
      let length = value.length;
      let stars = value.stars;
      let star_votes = value.starVotes;
      let summary = value.summary;
      let trail_url = value.url;
      let conditions = value.conditionStatus;
      let conditions_date = value.conditionDate;
      let conditions_time = value.conditionDetails;

      let nextTrail = new Trail(name, location, length, stars, star_votes, summary, trail_url, conditions, conditions_date, conditions_time);

      return nextTrail;
    });
    response.send(trailData);
  });
}

exports.getTrails = getTrails;