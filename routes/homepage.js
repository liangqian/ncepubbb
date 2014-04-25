var utility = require('./utility');

exports.show = function(req, res) {
    var info = utility.prepareRenderMessage(req);
    res.render('homepage', info);
}