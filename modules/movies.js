'use strict';

const superagent = require('superagent');

function Movie(title, overview, avg_votes, tot_votes, img_url, popularity, release) {
  this.title = title;
  this.overview = overview;
  this.average_votes = avg_votes;
  this.total_votes = tot_votes;
  this.image_url = img_url;
  this.popularity = popularity;
  this.released_on = release;
}

function getMovies(request, response) {
  const getCityName = `${request.query.data.formatted_query}`.split(',')[0];

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${getCityName}&page=1&include_adult=false`;

  superagent.get(url).then(data => {
    let movieArray = data.body.results;
    let movieData = movieArray.map(val => {
      let title = val.title;
      let overview = val.overview;
      let avgVotes = val.vote_average;
      let totVotes = val.vote_count;
      let imgURL = 'https://image.tmdb.org/t/p/w500' + val.poster_path;
      let popularity = val.popularity;
      let release = val.relase_date;
      let nextMovie = new Movie(title, overview, avgVotes, totVotes, imgURL, popularity, release);
      return nextMovie;
    });
    response.send(movieData);
  });
}

exports.getMovies = getMovies;