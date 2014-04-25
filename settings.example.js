var crypto = require('crypto');
var path = require('path');
var express = require('express');
var mongoStore = require('connect-mongo')(express);

var dbi = {
    db: 'Your Database Name'
};
var cookieSecret = "Your Cookie Secret, Random String";
module.exports = {
    perpage: 24,
    websiteName: 'OffChange',
    defaultPort: 3000,
    upload: "upload",
    imageCDN: "", // such as "http://subdomain.cdn.provider.com"
    secret: cookieSecret,
    frontSalt: 'Your Salt for Frontend Encryption, Random String',
    databaseInfo: dbi,
    sessionDb: {
        secret: cookieSecret,
        store: new mongoStore(dbi)
    },
    hashPassword: function(password) {
        return crypto.createHash('sha512').update(password + "Your Salt for Password Storage, Random String").digest('hex');
    }
};

module.exports.uploadPath = path.join(__dirname, 'public', module.exports.upload);