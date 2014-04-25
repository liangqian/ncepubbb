var crypto = require('crypto');
var path = require('path');
var express = require('express');
var mongoStore = require('connect-mongo')(express);

var dbi = {
    db: 'offchange'
};
var cookieSecret = "zSCkwfEJ8DuGafVg";
module.exports = {
    perpage: 20,
    websiteName: '华电帮帮邦',
    defaultPort: 3100,
    upload: "upload",
    imageCDN: "http://ncepubbb-com.qiniudn.com",
    secret: cookieSecret,
    frontSalt: 'Z4aT72xpZChrRpMv',
    databaseInfo: dbi,
    sessionDb: {
        secret: cookieSecret,
        store: new mongoStore(dbi)
    },
    hashPassword: function(password) {
        return crypto.createHash('sha512').update(password + "7mKhQVsErtLLJqXU").digest('hex');
    }
};

module.exports.uploadPath = path.join(__dirname, 'public', module.exports.upload);
