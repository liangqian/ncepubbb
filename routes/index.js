var user = require('./user');
var goods = require('./goods');
var homepage = require('./homepage');
var document = require('./document');

exports.setup = function(app) {
    app.get('/', homepage.show);

    app.get( '/user/login', user.showLogin);
    app.post('/user/login', user.execLogin);
    app.get( '/user/logout', user.execLogout);
    app.get( '/user/register', user.showRegister);
    app.post('/user/register', user.execRegister);
    app.get( '/user/modify', user.showModify);
    app.post('/user/modify', user.execModify);
    app.get( '/user/passwd', user.showPasswd);
    app.post('/user/passwd', user.execPasswd);

    app.get( '/admin',user.showList);
    app.get('/admin/star',user.star);
    app.get('/admin/failstar',user.failstar);
    app.get('/admin/delete',user.execDelete);
    app.get('/admin/resetpasswd',user.execResetpasswd);

    app.get( '/goods', goods.showList);
    app.get( '/goods/new', goods.showNew);
    app.post('/goods/new', goods.execNew);
    app.get( '/goods/:id', goods.show);
    app.get( '/goods/:id/modify', goods.showModify);
    app.post('/goods/:id/modify', goods.execModify);
    app.get( '/goods/:id/delete', goods.showDelete);
    app.post('/goods/:id/delete', goods.execDelete);
    app.get( '/goods/:id/chstatus', goods.chstatus);
    //app.get( '/goods/:id/chstatus.json', goods.chstatusjson);
    app.get( '/goods/:id/interest', goods.interest);

    app.get( '/help', document.help);
    app.get( '/duty', document.duty);

    //app.get( '/tags', tag.showList);
    //app.get( '/tag/:tag', tag.show);
};