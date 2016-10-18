import fetch from 'node-fetch';

//Redirect Movie API calls to TheMovieDB.org and return response
export default function(tmdbURL, tmdbKey, timeout) {
  return {
    getData: function(req, res) {
      var path  = req.get('path');

      //If no path is defined, request is malformed
      if(!path) {
        res.json({
          status: 400,
          error: 'Bad Request.',
        });
      }

      function correctSymbol(path) { return (path.includes('?')) ? '&' : '?'; }

      fetch(tmdbURL + path + correctSymbol(path) + 'api_key=' + tmdbKey,
      {
        method: 'GET',
        timeout: timeout,
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
    },
  }
};
