import fetch from 'node-fetch';
import {
  Movie,
}  from '../models'

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

      Movie.findOne({tmdbId: movieId})
      .then((movie) => {
        if(!!movie) {
          //We should be updating movies that haven't updated in the past day
          res.json(movie.data);
        } else {
          //Get movie from tmdb, save it to db, and send it to user
          const path = tmdbURL + '/movie/' + movieId + '?api_key=' + tmdbKey + '&append_to_response=videos,recommendations,credits';

          getTMDBMovieData(path, timeout)
          .then((response) => {
            if(typeof response === 'number') {
              res.sendStatus(response);
            } else if(response.id == movieId) {
              createMovieDocument(movieId, response).
              then((newMovie) => {
                console.log('Cached ' + newMovie.data.title);
                res.json(newMovie.data);
              });
            } else {
              res.sendStatus(500);
            }
          })
          .catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
        }
      })
    },
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
  .catch((error) => {
    res.sendStatus(500);
  });
};

const createMovieDocument = function(id, data) {
  var newMovie = new Movie({
    tmdbId: id,
    data: data,
  });

  return newMovie.save();
}
