require('dotenv').config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
const app = express()

const PORT               = process.env.PORT || 3001;
const TIMEOUT            = process.env.TIMEOUT || 3000;
const DB_URL             = process.env.DB_URL;
const MOVIE_DB_URL       = process.env.MOVIE_DB_URL;
const MOVIE_DB_KEY       = process.env.MOVIE_DB_KEY;
const FACEBOOK_APP_TOKEN = process.env.FACEBOOK_APP_TOKEN;

let moviedbImageURL = 'http://image.tmdb.org/t/p/'; //Should be getting this on start every few days

app.use(cors());

//Connect to database
mongoose.connect(DB_URL);

//Use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Use morgan to log
app.use(morgan('dev'));

//API Routes
app.get('/', function(req, res) {
  res.send('MovieCircle API');
});

app.get('/api/verifyFacebook', function(req, res) {
  const accessToken = req.get('Authorization');

  fetch('https://graph.facebook.com/debug_token?input_token=' + accessToken +'&access_token=' + FACEBOOK_APP_TOKEN,
    {
      method: 'GET',
      timeout: TIMEOUT,
    }
  )
  .then((response) => {
    if (response.status == 200) {
      return response.json()
    } else {
      res.sendStatus(reponse.status);
    }
  })
  .then((response) => {
    console.log('Facebook Debug', response, response.status);
    res.json({
      status: 200,
      is_valid: true,
    });
  })
  .catch((error) => {
    res.json({
      status: 503,
      error: 'Cannot reach Facebook API.',
    });
  });
});

//Redirect Movie API calls to TheMovieDB.org and return response
app.get('/movieapi', function(req, res) {
  var path  = req.get('path');

  //If no path is defined, request is malformed
  if(!path) {
    res.json({
      status: 400,
      error: 'Bad Request.',
    });
  }

  function correctSymbol(path) { return (path.includes('?')) ? '&' : '?'; }

  fetch(MOVIE_DB_URL + path + correctSymbol(path) + 'api_key=' + MOVIE_DB_KEY,
  {
    method: 'GET',
    timeout: TIMEOUT,
  })
  .then((response) => {
    if(response.status == 200) {
      return response.json();
    } else {
      res.json({
        status: 503,
        error: 'Cannot reach MovieDB API.'
      });
    }
  })
  .then((response) => {
    res.json(response);
  })
  .catch((error) => {
    res.json({
      status: 503,
      error: 'Cannot reach MovieDB API.',
    });
  });
});

app.get('/configuration', function(req, res) {
  res.json({
    base_url: moviedbImageURL,
  });
});


//Start server
app.listen(PORT);
console.log('Listening >> http://localhost:' + PORT);
