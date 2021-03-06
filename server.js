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

var fantasyData = {}; // global variable where our fantasy data will be stored

var yf = new YantasySports();

console.log("*** server.js: yf obj made");

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
      
      var isGameFootball = callUserGames();  
      if (!isGameFootball) {
        req.session.result = "This game is not Fantasy Football.";
        return;
      } else {
        
        async function asynchronousCalls() {
          var resultUserGameLeagues = await callUserGameLeagues();
          
          req.session.result = await fantasyData;
          return await res.redirect('/');
        }
        asynchronousCalls();
      }
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
//var port = process.env.PORT || 8080;
//app.listen(port, () => console.log(`Listening on port ${port}`));

async function callUserGames() {
  // gets the game key
  yf.user.games(
    function(err, data) {
      if (err)
        console.log(err);
      else {
        console.log("*** 1. user.games");
        
        fantasyData["game_key"] = data.games[0].game_key;
        if (fantasyData.game_key != 371)
          return false;
        else
          callUserGameLeagues();
      }
      
    }
  );
}

async function callUserGameLeagues() {
  // using the game key, get league name, num teams in league, league key and league id
  yf.user.game_leagues(
    fantasyData.game_key, //fantasyData["game_key"], // "371",
    function(err, data) {
      if (err)
        console.log(err);
      else {
        console.log("*** 2. user.game_leagues");
        
        fantasyData["league_name"] = data.leagues[0].leagues[0].name;
        fantasyData["num_teams"] = data.leagues[0].leagues[0].num_teams;
        fantasyData["league_key"] = data.leagues[0].leagues[0].league_key;
        fantasyData["league_id"] = data.leagues[0].leagues[0].league_id;
        callUserGameTeams();
        return true;
      }
    }
  );
}

async function callUserGameTeams() {
  // using the game key, get the user's team name, team key, and team id
  yf.user.game_teams(
    fantasyData.game_key,
    function(err, data) {
      if (err)
        console.log(err);
      else {
        console.log("*** 3. user.game_teams");
      
        fantasyData["team_name"] = data.teams[0].teams[0].name;
        fantasyData["team_key"] = data.teams[0].teams[0].team_key;
        fantasyData["team_id"] = data.teams[0].teams[0].team_id;
        callRosterPlayers();
        return true;
      }
    }
  );
}

async function callRosterPlayers() {
  // using the team key, get player info
  yf.roster.players(
    fantasyData.team_key,
    function(err, data) {
      if (err) {
        console.log("Error on yf.roster.players (4.)");
        console.log(err);
      } else {
        console.log("*** 4. roster.players");

        var roster = [];
        for (player in data.roster) {
          var currPlayer = {
            "name": data.roster[player].name.full,
            "position": data.roster[player].display_position,
            "team": data.roster[player].editorial_team_abbr
          }
          roster.push(currPlayer);
        }
        fantasyData["roster"] = roster;
        callLeagueScoreboard();
        return true;
      }
    }
  );
}

async function callLeagueScoreboard() {
  // using the league key, get info about the current matchup (score, teams)
  yf.league.scoreboard(
    fantasyData.league_key,
    15, // this is the last week that Camden had a game
    function(err, data) {
      if (err) {
        console.log("Error on yf.league.scoreboard (5.)");
        console.log(err);
      } else {
        console.log("*** 5. league.scoreboard");
        
        for (game in data.scoreboard.matchups) {
          if (data.scoreboard.matchups[game].teams[0].team_key != fantasyData.team_key && 
              data.scoreboard.matchups[game].teams[1].team_key != fantasyData.team_key) {
            continue; // if the user is not a part of this game, skip it
          } else { // this game is one that the user is in
            var opponent_name, opponent_score, opponent_proj, user_score, user_proj;
            
            // traverse array of the 2 teams in the matchup
            for (team in data.scoreboard.matchups[game].teams) { 
              if (data.scoreboard.matchups[game].teams[team].name != fantasyData.team_name) { // if is the opponent
                opponent_name = data.scoreboard.matchups[game].teams[team].name;
                opponent_score = data.scoreboard.matchups[game].teams[team].points.total;
                opponent_proj = data.scoreboard.matchups[game].teams[team].projected_points.total;
              } else { // else if is the user
                user_score = data.scoreboard.matchups[game].teams[team].points.total;
                user_proj = data.scoreboard.matchups[game].teams[team].projected_points.total;
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
            
            var ourData = JSON.stringify(fantasyData);
            var file = require('fs');
            file.writeFile('sample.json', ourData, 'utf8', function(err) {
              if (err) throw err;
              console.log('complete');
              }
            );
            
            // test that we successfully wrote the file by trying to read it back
            file.readFile('sample.json', 'utf8', function readFileCallback(err, data){
              if (err){
                console.log(err);
              } else {
                obj = JSON.parse(data); //now it an object
                console.log("NOW WE ARE READING THIS FILE");
                console.log(obj);
              }
            });
            
            return true; // user will only be in one game, so once we've found it we're done
          }
        }
        
      }
    }
  );
}
