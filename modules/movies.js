'use strict';

const superagent = require('superagent');

// Creates a movie with state readable by front-end app
function Movie(movieData) {

  this.title = movieData.title;
  this.overview = movieData.overview;
  this.average_votes = movieData.vote_average;
  this.total_votes = movieData.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/w500' + movieData.poster_path;
  this.popularity = movieData.popularity;
  this.released_on = movieData.relase_date;
}

// Takes user's location input and sends an array of movie data to front-end app
function getMovies(request, response) {

  // Uses user's input and formats for API endpoint
  const getCityName = `${request.query.data.formatted_query}`.split(',')[0];

  // API endpoint -- Uses location supplied from user's input
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${getCityName}&page=1&include_adult=false`;

  // Process data from endpoint request and create array of Movie objects.  Sends that array to front-end app
  superagent.get(url).then(dataFromEndpoint => {

    let movieArray = dataFromEndpoint.body.results;

    let movieDataToServer = movieArray.map(movieData => new Movie(movieData));

    response.send(movieDataToServer);
  });
}

exports.getMovies = getMovies;