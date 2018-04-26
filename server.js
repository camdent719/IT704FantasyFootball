
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

var clientId = process.env.APP_CLIENT_ID || require('./conf.js').APP_CLIENT_ID;
var clientSecret = process.env.APP_CLIENT_SECRET || require('./conf.js').APP_CLIENT_SECRET;
var redirectUri = process.env.APP_REDIRECT_URI || 'http://myapp.com/auth/yahoo/callback';

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
  if (req.session.result)
    data = JSON.stringify(req.session.result, null, 2);
  
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

app.get('/auth/yahoo', function(req, res) {
  var authorizationUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
  var queryParams = qs.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code'
  });

  res.redirect(authorizationUrl + '?' + queryParams);
});

app.get('/auth/yahoo/callback', function(req, res) {
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
      yf.user.games(
        function(err, data) {
          if (err)
            console.log(err);
          else
            req.session.result = data;
          
           return res.redirect('/');
        }
      );      
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
