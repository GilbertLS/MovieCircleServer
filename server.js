require('dotenv').config();

import express    from 'express';
import cors       from 'cors';
import bodyParser from 'body-parser';
import morgan     from 'morgan';
import mongoose   from 'mongoose';
import fetch      from 'node-fetch';
import routes     from './routes';

const PORT               = process.env.PORT || 3001;
const TIMEOUT            = process.env.TIMEOUT || 3000;
const DB_URL             = process.env.DB_URL;
const TMDB_URL           = process.env.TMDB_URL;
const TMDB_KEY           = process.env.TMDB_KEY;
const FACEBOOK_APP_TOKEN = process.env.FACEBOOK_APP_TOKEN;
const PAGE_SIZE          = process.env.PAGE_SIZE || 20;

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

//Initiate Routes
const tmdbRoutes = routes.tmdb(TMDB_URL, TMDB_KEY, TIMEOUT);
const authRoutes = routes.auth(FACEBOOK_APP_TOKEN, TIMEOUT);
const userRoutes = routes.user(PAGE_SIZE);

//API Routes
app.get('/', function(req, res) {
  res.send('MovieCircle API');
});

//Auth routes
app.get('/api/login', authRoutes.login);

//User routes
app.post('/api/user/:userId/favorite/:movieId', userRoutes.postFavorite);
app.delete('/api/user/:userId/favorite/:movieId', userRoutes.deleteFavorite);
app.get('/api/user/:userId/favorite/:page', userRoutes.getFavorite);
app.post('/api/user/:userId/watched/:movieId', userRoutes.postWatched);
app.delete('/api/user/:userId/watched/:movieId', userRoutes.deleteWatched);
app.get('/api/user/:userId/watched/:page', userRoutes.getWatched);
app.post('/api/user/:userId/watchlater/:movieId', userRoutes.postWatchLater);
app.delete('/api/user/:userId/watchlater/:movieId', userRoutes.deleteWatchLater);
app.get('/api/user/:userId/watchLater/:page', userRoutes.getWatchLater);

//Movie routes
app.get('/api/movie/:movieId', tmdbRoutes.getMovieInfo);
app.get('/api/movie/popular/:page', tmdbRoutes.getPopular);
app.get('/api/movie/top_rated/:page', tmdbRoutes.getTopRated);
app.get('/api/movie/now_playing/:page', tmdbRoutes.getNowPlaying);
app.get('/api/movie/upcoming/:page', tmdbRoutes.getUpcoming);
app.get('/api/search/:query/:page', tmdbRoutes.search);

app.get('/configuration', function(req, res) {
  res.json({
    base_url: tmdbImageURL,
  });
});


//Start server
app.listen(PORT);
console.log('Listening >> http://*:' + PORT);
