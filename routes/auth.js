import fetch from 'node-fetch';
import {
  User,
}  from '../models'

//Redirect Movie API calls to TheMovieDB.org and return response
export default function(facebookAppToken, timeout) {
  return {
    login: function(req, res) {
      const accessToken = req.get('Authorization');

      fetch('https://graph.facebook.com/debug_token?input_token=' + accessToken +'&access_token=' + facebookAppToken,
        {
          method: 'GET',
          timeout: timeout,
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
        console.log('Facebook Debug', response);
        if(response.data && response.data.is_valid) {
          login(response.data, accessToken, res);
        } else {
          res.sendStatus(401);
        }
      })
      .catch((error) => {
        res.sendStatus(503);
      });
    }
  };
};

function login(facebookData, accessToken, res) {
  User.findOne({facebookId: facebookData.user_id}, (err, user) => {
    if(err) return console.error(err);

    if(user == null) {
      //Cannot find user, create a new one
      createUser(facebookData, accessToken)
      .then((newUser) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        res.sendStatus(500);
      });
    } else {
      //Update user with new accessToken
      user.accessToken = {
        token: accessToken,
        expiresAt: facebookData.expires_at,
      };

      user.save()
      .then((newUser) => {
        res.sendStatus(200);
      })
      .catch((error) => {
        res.sendStatus(500);
      });
    }
  });
}

function createUser(facebookData, accessToken) {
  const newUser = new User({
    facebookId: facebookData.user_id,
    accessToken: {
      token: accessToken,
      expiresAt: facebookData.expires_at,
    },
    friends: [],
  });

  return newUser.save();
}
