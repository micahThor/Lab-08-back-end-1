'use strict';

const superagent = require('superagent');

// Creates a eventBrite with state readable by front-end app
function EventBrite(eventData) {
  this.link = eventData.url;
  this.name = eventData.title;
  this.event_date = new Date(eventData.start_time).toDateString();
  this.summary = eventData.summary;
}

// Takes user's location input and sends an array of eventbrite data to front-end app
function getEventBrite(request, response) {

  // API endpoint -- Uses coordinates supplied from user's input
  const url = `http://api.eventful.com/json/events/search?location=${request.query.data.formatted_query}&app_key=${process.env.EVENTBRITE_API_KEY}`;

  // Process data from endpoint request and create array of Trail objects.  Sends that array to front-end app
  superagent.get(url).then(dataFromEndpoint => {
    const parsedData = JSON.parse(dataFromEndpoint.text);

    const eventDataToServer = parsedData.events.event.map(eventBriteEvent => new EventBrite(eventBriteEvent));

    response.status(200).send(eventDataToServer);
  }).catch(err => {
    console.error(err);
    response.status(500).send('Status 500: Internal Server Error');
  });
}

exports.getEventBrite = getEventBrite;