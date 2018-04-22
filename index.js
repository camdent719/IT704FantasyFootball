var FantasySports = require('FantasySports');
FantasySports.options({
  "accessTokenUrl": "https://api.login.yahoo.com/oauth/v2/get_request_token",
  "requestTokenUrl": "https://api.login.yahoo.com/oauth/v2/get_token",
  "oauthKey": process.env.OAUTHKEY,
  "oauthSecret": process.env.OAUTHSECRET,
  "version": "1.0",
  "callback": "http://it704s.wcit.cs.unh.edu/auth/oauth/callback",
  "encryption": "HMAC-SHA1"
};);

exports.oauth = function(req, res) {
  FantasySports.startAuth(req, res);
};

// app.get("/auth/oauth/callback")
exports.authorize = function(req, res) {
  FantasySports.endAuth(req, res);
};

app.use(express.cookieSession({ 
  key: 'some key', 
  secret: 'some secret', 
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