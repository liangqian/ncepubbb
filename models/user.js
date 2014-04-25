var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    name: { type: String, index: {unique: true} },
    password:  String,
    privilege: { type: String, default: "user" },
    registerDate: {type: Date, default: Date.now },
    contact: {
        studentID: String,
        phone:     String,
        qq:        String,
        wechat:    String,
        image:     String
    }
});

module.exports = db.model('user', schema);

module.exports.check = function(name, password, cb) {
    module.exports.findOne({name: name}, function(err, found) {
        if (err || !found || found.password !== password)
            return cb('user not found');
        return cb();
    });
};
