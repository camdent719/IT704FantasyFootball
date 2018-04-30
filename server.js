
/**
 * Create conf.js like below
 *
 * module.exports = {
 *   'APP_CLIENT_ID': 'CLIENT_ID_GIVEN_BY_YAHOO',
 *   'APP_CLIENT_SECRET': 'CLIENT_SECRET_GIVEN_BY_YAHOO'
 * }
 */

var path = require('path');
var qs = require('querystring');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var YantasySports = require('yahoo-fantasy-without-auth');

var clientId = require('./conf.js').clientId;
var clientSecret = require('./conf.js').clientSecret;
var redirectUri = require('./conf.js').redirectUri;

var fantasyData = require('./global.js').fantasyData;

var yf = new YantasySports();

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 80);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  var data;
  if (req.session.result) {
    data = JSON.stringify(req.session.result, null, 2); // gets string rep. of data
  }
  
  res.render('home', {
    title: 'Home',
    user: req.session.token,
    data: data
  });
});

app.get('/logout', function(req, res) {
  delete req.session.token;
  res.redirect('/');
});

app.get('/auth/test', function(req, res) {
  var authorizationUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
  var queryParams = qs.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code'
  });

  res.redirect(authorizationUrl + '?' + queryParams);
});

app.get('/auth/test/callback', function(req, res) {
  var accessTokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
  var options = {
    url: accessTokenUrl,
    headers: { Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64') },
    rejectUnauthorized: false,
    json: true,
    form: {
      code: req.query.code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }
  };

  request.post(options, function(err, response, body) {
    if (err)
      console.log(err);
    else {
      var accessToken = body.access_token;
      // TODO : Handle this refreshToken!
      //var refreshToken = body.refresh_token;

      req.session.token = accessToken;
      yf.setUserToken(accessToken);
      
      var isGameFootball = true;
      // gets the game key
      yf.user.games(
        function(err, data) {
          if (err)
            console.log(err);
          else {
            req.session.result = data;
            fantasyData["game_key"] = req.session.result.games[0].game_key;
            if (fantasyData.game_key != 371)
              isGameFootball = false;
          }
          //return res.redirect('/');
          //console.log("yf.user.games " + fantasyData);
        }
      );
      
      if (!isGameFootball) {
        req.session.result = "This game is not Fantasy Football.";
        return;
      } else {
        console.log("this IS in fact fantasy football - 371");
      }
      
      // using the game key, get league name, num teams in league, league key and league id
      yf.user.game_leagues(
        "371", //fantasyData.game_key, //fantasyData["game_key"], 
        function(err, data) {
          if (err)
            console.log(err);
          else {
            req.session.result = data;
            fantasyData["league_name"] = req.session.result.leagues[0].leagues[0].name;
            fantasyData["num_teams"] = req.session.result.leagues[0].leagues[0].num_teams;
            fantasyData["league_key"] = req.session.result.leagues[0].leagues[0].league_key;
            fantasyData["league_id"] = req.session.result.leagues[0].leagues[0].league_id;
          }
          //return res.redirect('/');
          //console.log("yf.user.game_leagues " + fantasyData);
        }
      );
      
      // using the game key, get the user's team name, team key, and team id
      yf.user.game_teams(
        "371", //fantasyData.game_key, //fantasyData["game_key"], 
        function(err, data) {
          if (err)
            console.log(err);
          else {
            req.session.result = data;
            fantasyData["team_name"] = req.session.result.teams[0].teams[0].name;
            fantasyData["team_key"] = req.session.result.teams[0].teams[0].team_key;
            fantasyData["team_id"] = req.session.result.teams[0].teams[0].team_id;
          }
          //return res.redirect('/');
          //console.log("yf.user.game_teams " + fantasyData);
        }
      );
      
      // using the team key, get player info
      yf.roster.players(
        fantasyData.team_key, //fantasyData["team_key"], //"371.l.1075055.t.9", //
        function(err, data) {
          if (err) {
            console.log("Error on yf.roster.players");
            console.log(err);
          } else {
            req.session.result = data;
            var roster = [];
            for (player in req.session.result.roster) {
              var currPlayer = {
                "name": req.session.result.roster[player].name.full,
                "position": req.session.result.roster[player].display_position,
                "team": req.session.result.roster[player].editorial_team_abbr
              }
              roster.push(currPlayer);
            }
            fantasyData["roster"] = roster;
            
            req.session.result = fantasyData;
          }
          //console.log(fantasyData);
          //return res.redirect('/');
        }
      );
      
      // using the league key, get info about the current matchup (score, teams)
      yf.league.scoreboard(
        fantasyData.league_key, //fantasyData["league_key"], //"371.l.1075055", //
        15, // this is the last week that Camden had a game
        function(err, data) {
          if (err) {
            console.log("Error on yf.league.scoreboard");
            console.log(err);
          } else {
            req.session.result = data;
            
            for (game in req.session.result.scoreboard.matchups) {
              if (req.session.result.scoreboard.matchups[game].teams[0].team_key != fantasyData.team_key && 
                  req.session.result.scoreboard.matchups[game].teams[1].team_key != fantasyData.team_key) {
                continue; // if the user is not a part of this game, skip it
              } else { // this game is one that the user is in
                var opponent_name, opponent_score, opponent_proj, user_score, user_proj;
                
                // traverse array of the 2 teams in the matchup
                for (team in req.session.result.scoreboard.matchups[game].teams) { 
                  if (req.session.result.scoreboard.matchups[game].teams[team].name != fantasyData.team_name) { // if is the opponent
                    opponent_name = req.session.result.scoreboard.matchups[game].teams[team].name;
                    opponent_score = req.session.result.scoreboard.matchups[game].teams[team].points.total;
                    opponent_proj = req.session.result.scoreboard.matchups[game].teams[team].projected_points.total;
                  } else { // else if is the user
                    user_score = req.session.result.scoreboard.matchups[game].teams[team].points.total;
                    user_proj = req.session.result.scoreboard.matchups[game].teams[team].projected_points.total;
                  }
                }
                
                var matchup = { // create matchup obj with matchup info
                  "opponent_name": opponent_name,
                  "opponent_score": opponent_score,
                  "opponent_proj": opponent_proj,
                  "user_score": user_score,
                  "user_proj": user_proj
                }
                fantasyData["matchup"] = matchup;
                break; // user will only be in one game, so once we've found it we're done
              }
            }
            
            console.log("yf.league.scoreboard " + fantasyData);
            req.session.result = fantasyData;
          }
          return res.redirect('/');
        }
      );
      //console.log(fantasyData);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
