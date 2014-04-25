var utility = require('./utility');

exports.help = function(req, res) {
    var info = utility.prepareRenderMessage(req);
    res.render('help', info);
}

exports.duty = function(req, res) {
    var info = utility.prepareRenderMessage(req);
    res.render('duty', info);
}