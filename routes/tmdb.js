import fetch from 'node-fetch';

import {
  Movie,
  User,
  Favorite,
  Watched,
  WatchLater,
}  from '../models'

import {
  getTime,
  getAuthenticatedUser,
} from '../utility';

const Promise = global.Promise;

//Redirect Movie API calls to TheMovieDB.org and return response
export default function(tmdbURL, tmdbKey, timeout) {
  return {
    getPopular(req, res) {
      let  path = tmdbURL + '/movie/popular?api_key=' + tmdbKey;
      const page = req.params.page;

      if(!!page) {
        path = path + '&page=' + page;
      }

      getTMDBMovieData(path, timeout)
      .then((response) => {
        if(typeof response === 'number') {
          res.sendStatus(response);
        } else {
          res.json(response);
        }
      });
    },
    getTopRated(req, res) {
      let path = tmdbURL + '/movie/top_rated?api_key=' + tmdbKey;
      const page = req.params.page;

      if(!!page) {
        path = path + '&page=' + page;
      }

      getTMDBMovieData(path, timeout)
      .then((response) => {
        if(typeof response === 'number') {
          res.sendStatus(response);
        } else {
          res.json(response);
        }
      });
    },
    getNowPlaying(req, res) {
      let path = tmdbURL + '/movie/now_playing?api_key=' + tmdbKey;
      const page = req.params.page;

      if(!!page) {
        path = path + '&page=' + page;
      }

      getTMDBMovieData(path, timeout)
      .then((response) => {
        if(typeof response === 'number') {
          res.sendStatus(response);
        } else {
          res.json(response);
        }
      });
    },
    getUpcoming(req, res) {
      let path = tmdbURL + '/movie/upcoming?api_key=' + tmdbKey;
      const page = req.params.page;

      if(!!page) {
        path = path + '&page=' + page;
      }

      getTMDBMovieData(path, timeout)
      .then((response) => {
        if(typeof response === 'number') {
          res.sendStatus(response);
        } else {
          res.json(response);
        }
      });
    },
    search(req, res) {
      let path = tmdbURL + '/search/movie?api_key=' + tmdbKey;

      const query = req.params.query;
      const page  = req.params.page;

      if(!!page) {
        path = path + '&page=' + page;
      }

      if(!!query) {
        path = path + '&query=' + query;
      } else {
        res.sendStatus(400);
      }

      getTMDBMovieData(path, timeout)
      .then((response) => {
        if(typeof response === 'number') {
          res.sendStatus(response);
        } else {
          res.json(response);
        }
      });
    },
    getMovieInfo(req, res) {
      const movieId = req.params.movieId;

      getMovieDocument(movieId, tmdbURL, tmdbKey, timeout)
      .then((movie) => {
        if(!!movie) {
          res.json(movie.data);
        } else {
          res.sendStatus(500);
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
    },
    getAuthMovieInfo(req, res) {
      const accessToken = req.get('Authorization');
      const movieId = req.params.movieId;
      const userId = req.params.userId;

      Promise.all([
        getMovieDocument(movieId, tmdbURL, tmdbKey, timeout),
        getAuthenticatedUser(accessToken, userId),
      ])
      .then((results) => {
        const movie = results[0];
        const user  = results[1];

        if(!!movie && !!user) {
          getUserMovieDetails(user, movie)
          .then((details) => {
            console.log('Details', details);
            let data = movie.data;
            data.user_details = details;
            res.json(data);
          });
        } else if (!user) {
          res.sendStatus(401);
        } else if (!movie) {
          res.sendStatus(404);
        } else {
          res.sendStatus(500);
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
    }
  }
};

const getTMDBMovieData = function(path, timeout) {
  return fetch(path,
  {
    method: 'GET',
    timeout: timeout,
  })
  .then((response) => {
    if(response.status == 200) {
      return response.json();
    } else {
      return 500;
    }
  })
  .catch((err) => {
    console.log(err);
    return 500;
  });
};

const createMovieDocument = function(id, data) {
  var newMovie = new Movie({
    tmdbId: id,
    data: data,
  });

  return newMovie.save();
}

const getMovieDocument = function(movieId, tmdbURL, tmdbKey, timeout) {
  return Movie.findOne({tmdbId: movieId})
  .then((movie) => {
    if(!!movie) {
      //Fix: We should be updating movies that haven't updated in a while
      return movie;
    } else {
      //Get movie from tmdb, save it to db, and send it to user
      const path = tmdbURL + '/movie/' + movieId + '?api_key=' + tmdbKey + '&append_to_response=videos,recommendations,credits';

      return getTMDBMovieData(path, timeout)
      .then((response) => {
        if(response.id == movieId) {
          return createMovieDocument(movieId, response)
          .then((newMovie) => {
            console.log('Cached ' + newMovie.data.title);
            return newMovie;
          });
        } else {
          return undefined;
        }
      });
    }
  });
}

const getUserMovieDetails = function(user, movie) {
  return Promise.all([
    Favorite.findOne({_user: user._id, _movie: movie._id}).exec(),
    Watched.findOne({_user: user._id, _movie: movie._id}).exec(),
    WatchLater.findOne({_user: user._id, _movie: movie._id}).exec(),
  ])
  .then((results) => {
    let details = {
      favorite: !!results[0],
      watched: !!results[1],
      watch_later: !!results[2],
    }

    return details;
  })
  .catch((err) => {
    console.error(err);
    return {
      favorite: false,
      watched: false,
      watch_later: false,
    };
  });
}
