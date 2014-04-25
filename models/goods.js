var db = require('./db');
var Schema = db.Schema;
var schema = new Schema({
    title:      String,
    content:    String,
    user:       String,
    status:     String,
    tags:       [String],
    class:      String,
    school:     String,
    intenum:    { type: Number, default: 0 },
    interest:   [String],
    images:     [{
        description: String,
        path:        String,
    }],
    postDate:   { type: Date, default: Date.now },
    modifyDate: { type: Date, default: Date.now }
});

module.exports = db.model('goods', schema);