## NodeJS sample app for [Yahoo OAuth 2.0](https://developer.yahoo.com/oauth2/guide) + [yfsapi-without-auth](https://github.com/withsmilo/yfsapi-without-auth)

This is a NodeJS sample application which uses Yahoo OAuth 2.0 and yfsapi-without-auth, to access [Yahoo Fantasy Sports API](https://developer.yahoo.com/fantasysports/guide) easily. I've created a customized version of [sahat/yahoo-oauth2-tutorial](https://github.com/sahat/yahoo-oauth2-tutorial/). To keep it simple, I tested yfsapi's [user.games API](http://yfantasysandbox.herokuapp.com/resource/user/games) only. You can experience it on [my sandbox site](https://yfsapi-oauth2-test-sandbox.herokuapp.com). If you would like to test it locally, please follow next steps.

This application was tested on Ubuntu 15.10.

### Prerequisites

Go to [https://developer.apps.yahoo.com](https://developer.apps.yahoo.com) and create new Yahoo app.
* Application Name : anyone you want
* Application Type : Web Application
* Callback Domain : `myapp.com`
* API Permissions : Fantasy Sports [Read/Write]

Record your application's Client ID(Consumer Key) and Client Secret(Consumer Secret) given by Yahoo.

### Setup

##### 1. Install node.js dependencies
```bash
$ npm install
```

##### 2. Edit /ets/hosts
```bash
$ sudo vi /ets/hosts
Add `127.0.0.1 myapp.com`.
```

##### 3. Create new file, conf.js
```javascript
module.exports = {
  'APP_CLIENT_ID': 'YOUR_CLIENT_ID_HERE',
  'APP_CLIENT_SECRET': 'YOUR_CLIENT_SECRET_HERE'
}
```

### Test

##### 1. Run the application
```bash
$ sudo node server.js
```

##### 2. Open `http://myapp.com` in your browser

##### 3. Log-in Yahoo by clicking right-top `Sign in with Yahoo` button.

### License

This module is available under the [MIT License](http://opensource.org/licenses/MIT).

