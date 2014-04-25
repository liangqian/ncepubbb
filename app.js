
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var settings = require('./settings');
var ejs = require('ejs');
var http = require('http');
var path = require('path');
var moment = require('moment');
var utility = require('./routes/utility');

var app = express();

ejs.filters.or = function(arg, sub) {
    return arg || sub;
}
ejs.filters.formatDate = function(str) {
    return moment(str).format('YYYY-MM-DD hh:mm:ss');
}

// all environments
app.set('port', process.env.PORT || settings.defaultPort);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(settings.secret));
app.use(express.session(settings.sessionDb));
app.use(express.bodyParser({uploadDir: '/srv/offchange/tmp'}));
app.use(function(req, res, next) {
    utility.initSession(req);
    next();
})
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes.setup(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('[OffChange] server listening on port ' + app.get('port'));
});
