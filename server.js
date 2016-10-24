require('dotenv').config();

import express    from 'express';
import cors       from 'cors';
import bodyParser from 'body-parser';
import morgan     from 'morgan';
import mongoose   from 'mongoose';
import fetch      from 'node-fetch';

const PORT               = process.env.PORT || 3001;
const TIMEOUT            = process.env.TIMEOUT || 3000;
const DB_URL             = process.env.DB_URL;
const TMDB_URL           = process.env.TMDB_URL;
const TMDB_KEY           = process.env.TMDB_KEY;
const FACEBOOK_APP_TOKEN = process.env.FACEBOOK_APP_TOKEN;

let tmdbImageURL = 'http://image.tmdb.org/t/p/'; //Should be getting this on start and every few days

const app = express();
app.use(cors());

//Connect to database
mongoose.Promise = global.Promise;
mongoose.connect(DB_URL);

//Use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Use morgan to log
app.use(morgan('dev'));

//Import Routes
import routes from './routes';
const tmdbRoutes = routes.tmdb(TMDB_URL, TMDB_KEY, TIMEOUT);
const authRoutes = routes.auth(FACEBOOK_APP_TOKEN, TIMEOUT);
const userRoutes = routes.user(TIMEOUT);

//API Routes
app.get('/', function(req, res) {
  res.send('MovieCircle API');
});

app.get('/api/login', authRoutes.login);

app.post('/api/user/:userId/favorite/:movieId', userRoutes.postFavorite);
app.delete('/api/user/:userId/favorite/:movieId', userRoutes.deleteFavorite);
//app.get('/api/user/:userId/favorite', userRoutes.getFavorites);
app.post('/api/user/:userId/watched/:movieId', userRoutes.postWatched);
app.delete('/api/user/:userId/watched/:movieId', userRoutes.deleteWatched);
//app.get('/api/user/:userId/watched', userRoutes.getWatched);
app.post('/api/user/:userId/watchlater/:movieId', userRoutes.postWatchLater);
app.delete('/api/user/:userId/watchlater/:movieId', userRoutes.deleteWatchLater);
//app.get('/api/user/:userId/watchLater', userRoutes.getWatchLater);

app.get('/movieapi', tmdbRoutes.getData);

app.get('/configuration', function(req, res) {
  res.json({
    base_url: tmdbImageURL,
  });
});


//Start server
app.listen(PORT);
console.log('Listening >> http://*:' + PORT);
