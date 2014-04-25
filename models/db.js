var settings = require('../settings');
var dbI = settings.databaseInfo;
module.exports = db = require('mongoose');

var auth = dbI.username ? 
    ('' + dbI.username + ':' + dbI.password + '@') : '';
var host = dbI.host || '202.206.221.105';
var port = dbI.port || 27017;
var dbn = dbI.db;

db.connect('mongodb://' + auth + host + ':' + port + '/' + dbn);
db.connection.on('error', console.error.bind(console, 'connection error:'));
