import fetch from 'node-fetch';
import {
  User,
  Favorite,
  Watched,
  WatchLater,
}  from '../models'

const MONGO_DUPLICATE = 11000;

export default function(timeout) {
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
  }
}

const getTime = function() {
  const d = new Date();
  return Math.floor(d.getTime()/1000);
};

const getAuthorizedUser = function(accessToken, userId) {
  if(!!accessToken) {
    return User.findOne({facebookId: userId})
    .then((user) => {
      if(!!user && user.accessToken.token == accessToken && user.accessToken.expiresAt > getTime()) {
        //User is authenticated
        return user;
      } else {
        return undefined;
      }
    });
  }
};

const addDocument = function(accessToken, userId, movieId, Model) {
  return getAuthorizedUser(accessToken, userId)
  .then((user) => {
    //Check movie database to make sure movie exists
    if(!!user) {
      var newDocument = new Model({
        user: user._id,
        movie: movieId,
        key: user._id +'/'+ movieId,
      });

      return newDocument.save()
      .then((savedDocument) => {
        return 200;
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

const deleteDocument = function(accessToken, userId, movieId, Model) {
  return getAuthorizedUser(accessToken, userId)
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
