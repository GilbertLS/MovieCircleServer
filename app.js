require('dotenv').config();
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');

var PORT = 3000;
var DB_URL = 'mongodb://localhost/moviedb';
var MOVIE_DB_URL = 'https://api.themoviedb.org/3';
var MOVIE_DB_KEY = process.env.MOVIE_DB_KEY;
var FACEBOOK_APP_TOKEN = process.end.FACEBOOK_APP_TOKEN;

//Enable CORS
app.use(cors());

//Connect to mongoose
mongoose.connect(DB_URL);
var db = mongoose.connection;

//Redirect Movie API calls to TheMovieDB.org and return response
app.get('/movieapi', function(req, res) {
  var path  = req.get('path');

  function callback(error, response, body) {
    if(!error && response.statusCode == 200) {
      res.send(body);
    } else {
      res.send({
        error: true,
        status: response.statusCode,
      });
    }
  }

  function correctSymbol(path) { return (path.includes('?')) ? '&' : '?'; }

  request(
    {
      url: MOVIE_DB_URL + path + correctSymbol(path) + 'api_key=' + MOVIE_DB_KEY,
      method: 'GET',
    },
    callback
  );
});

//Facebook calls
app.post('/api/facebooklogin', function(req, res) {
  var accessToken = req.get('accessToken');

  function callback(response) {
    console.log(response);
    res.send('hello');
  }

  request(
    {
      url: 'https://graph.facebook.com/debug_token?input_token=' + accessToken + '&access_token=' + FACEBOOK_APP_TOKEN,
      method: 'GET'
    },
    callback
  );
});

app.listen(PORT);
console.log('Running on port ' + PORT + '...');
