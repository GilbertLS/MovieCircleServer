import {
  User,
} from '../models'

const getAuthenticatedUser = function(accessToken, userId) {
  return User.findOne({facebookId: userId})
  .then((user) => {
    if(
      !!user &&
      user.accessToken.token == accessToken &&
      user.accessToken.expiresAt > getTime()
    ) {
      return user; //User is authenticated
    } else {
      return undefined;
    }
  });
};

const getTime = function() {
  const d = new Date();
  return Math.floor(d.getTime()/1000);
};

exports.getAuthenticatedUser = getAuthenticatedUser;
exports.getTime = getTime;
