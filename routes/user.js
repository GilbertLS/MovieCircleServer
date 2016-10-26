import fetch from 'node-fetch';

import {
  User,
  Favorite,
  Watched,
  WatchLater,
  Movie,
}  from '../models';

import {
  getTime,
  getAuthenticatedUser,
} from '../utility';

const MONGO_DUPLICATE = 11000;

export default function(pageSize) {
  return {
    postFavorite: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const movieId = req.params.movieId;

      addDocument(accessToken, userId, movieId, Favorite)
      .then((status) => {
        res.sendStatus(status);
      });
    },
    deleteFavorite: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const movieId = req.params.movieId;

      deleteDocument(accessToken, userId, movieId, Favorite)
      .then((status) => {
        res.sendStatus(status);
      });
    },
    getFavorite: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const page = req.params.page;

      getPaginatedDocuments(accessToken, userId, page, Favorite, pageSize)
      .then((result) => {
        if(typeof result === 'number') {
          res.sendStatus(result);
        } else {
          res.json(result);
        }
      })
    },
    postWatched: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const movieId = req.params.movieId;

      addDocument(accessToken, userId, movieId, Watched)
      .then((status) => {
        res.sendStatus(status);
      });
    },
    deleteWatched: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const movieId = req.params.movieId;

      deleteDocument(accessToken, userId, movieId, Watched)
      .then((status) => {
        res.sendStatus(status);
      });
    },
    getWatched: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const page = req.params.page;

      getPaginatedDocuments(accessToken, userId, page, Watched, pageSize)
      .then((result) => {
        if(typeof result === 'number') {
          res.sendStatus(result);
        } else {
          res.json(result);
        }
      })
    },
    postWatchLater: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const movieId = req.params.movieId;

      addDocument(accessToken, userId, movieId, WatchLater)
      .then((status) => {
        res.sendStatus(status);
      });
    },
    deleteWatchLater: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const movieId = req.params.movieId;

      deleteDocument(accessToken, userId, movieId, WatchLater)
      .then((status) => {
        res.sendStatus(status);
      });
    },
    getWatchLater: function(req, res) {
      const accessToken = req.get('Authorization');
      const userId = req.params.userId;
      const page = req.params.page;

      getPaginatedDocuments(accessToken, userId, page, WatchLater, pageSize)
      .then((result) => {
        if(typeof result === 'number') {
          res.sendStatus(result);
        } else {
          res.json(result);
        }
      })
    },
  }
}

//This should only be used with Favorite, Watched, WatchLater
const addDocument = function(accessToken, userId, movieId, Model) {
  return getAuthenticatedUser(accessToken, userId)
  .then((user) => {
    if(!!user) {
      //Check movie database to make sure movie exists
      return Movie.findOne({tmdbId: movieId})
      .then((movie) => {
        if(!!movie) {
          var newDocument = new Model({
            _user: user._id,
            _movie: movie._id,
            tmdbId: movieId,
            key: user._id +'/'+ movieId,
          });

          return newDocument.save()
          .then((savedDocument) => {
            return 200;
          });
        } else {
          return 404;
        }
      });
    } else {
      //Not authenticated properly
      return 401;
    }
  })
  .catch((err) => {
    console.error(err);
    if(err.code == MONGO_DUPLICATE) {
      //Return successful even if duplicate was found
      return 200;
    } else {
      return 500;
    }
  });
};

//This should only be used with Favorite, Watched, WatchLater
const deleteDocument = function(accessToken, userId, movieId, Model) {
  return getAuthenticatedUser(accessToken, userId)
  .then((user) => {
    if(!!user) {
      return Model.findOne({key: user._id +'/'+ movieId}).remove()
      .then((deletedDocument) => {
        return 200;
      });
    } else {
      //Not authenticated properly
      return 401;
    }
  })
  .catch((err) => {
    console.error(err);
    return 500;
  });
};

//This should only be used with Favorite, Watched, WatchLater
const getPaginatedDocuments = function(accessToken, userId, page, Model, pageSize) {
  page = parseInt(page);
  return getAuthenticatedUser(accessToken, userId)
  .then((user) => {
    if(!!user) {
      if(page == NaN) {
        return 400;
      }

      return Model.find({_user: user._id})
      .skip(pageSize*(page-1))
      .limit(pageSize)
      .populate('_movie', 'data')
      .then((array) => {
        let response = {
          page: page,
          results: [],
        };

        array.forEach((movie) => {
          response.results.push(movie._movie.data);
        });

        return response;
      });
    } else {
      //Not authenticated properly
      return 401;
    }
  })
  .catch((err) => {
    console.error(err);
    return 500;
  });
}
