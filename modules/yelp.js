'use strict';

const superagent = require('superagent');

// Creates a yelpRestaurant with state readable by front-end app
function yelpRestaurant(reviewData) {
  this.name = reviewData.name;
  this.image_url = reviewData.image_url;
  this.price = reviewData.price;
  this.rating = reviewData.rating;
  this.url = reviewData.url;
}

// Takes user's location input and sends an array of trail data to front-end app
function getYelp(request, response) {

  // API endpoint -- Uses coordinates supplied from user's input
  const url = `https://api.yelp.com/v3/businesses/search?term="restaurants"&location="${request.query.data.formatted_query}"`;

  // Process data from endpoint request and create array of yelp restuarant objects.  Sends that array to front-end app
  superagent.get(url).set('Authorization', `BEARER ${process.env.YELP_API_KEY}`).then(dataFromEndpoint => {

    const yelpJSON = JSON.parse(dataFromEndpoint.text);

    const restaurantArray = yelpJSON.businesses;

    const restaurantData = restaurantArray.map(reviewData => new yelpRestaurant(reviewData));

    response.status(200).send(restaurantData);

  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  });
}

exports.getYelp = getYelp;