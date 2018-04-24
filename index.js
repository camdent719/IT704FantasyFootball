var http = require('http');
var express = require('express');
var app = express();

/*http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Hello World!');
}).listen(8080);*/

var FantasySports = require('fantasysports');
var router = express.Router();

FantasySports.options({
  "accessTokenUrl": "https://api.login.yahoo.com/oauth/v2/get_request_token",
  "requestTokenUrl": "https://api.login.yahoo.com/oauth/v2/get_token",
  "oauthKey": process.env.OAUTHKEY,
  "oauthSecret": process.env.OAUTHSECRET,
  "version": "1.0",
  "callback": "http://fantasyfootballdashboard-fantasyfootballdashboard.193b.starter-ca-central-1.openshiftapps.com/",
  "encryption": "HMAC-SHA1"
});

//router.get('/authors', author_controller.author_list);
app.get("/auth/oauth");
app.get("/auth/oauth/callback")

exports.oauth = function(req, res) {
  FantasySports.startAuth(req, res);
};

// app.get("/auth/oauth/callback")
exports.authorize = function(req, res) {
  FantasySports.endAuth(req, res);
};

app.use(express.cookieSession({ 
  key: 'dj0yJmk9dEpvVlZxeWp5RUt1JmQ9WVdrOU4wMUJaRUpUTlRBbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1hNw--', 
  secret: '87e5a6384522209bc709c00f6007a3047c7a8a95', 
  proxy: true 
}));

exports.myTeams = function(req, res) {
  FantasySports
      .request(req, res)
      .api('http://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json')
      .done(function(data) {
          var leagueData = data.fantasy_content.users[0].user[1].games[0].game[1].leagues,
              leagues = [];

          _.each(leagueData, function(value) {
              if (value.league) leagues.push(value.league[0]);
          });

          res.json(leagues);
      });
};