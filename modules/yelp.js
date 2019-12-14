'use strict';

const superagent = require('superagent');

function yelpRestaurant(name, img, price, rating, url) {
  this.name = name;
  this.image_url = img;
  this.price = price;
  this.rating = rating;
  this.url = url;
}

function getYelp(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?term="restaurants"&location="${request.query.data.formatted_query}"`;

  superagent.get(url).set('Authorization', `BEARER ${process.env.YELP_API_KEY}`).then(data => {
    const yelpJSON = JSON.parse(data.text);
    const restaurantArray = yelpJSON.businesses;
    const restaurantData = restaurantArray.map(value => {
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
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  });
}

exports.getYelp = getYelp;