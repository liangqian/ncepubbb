var fs = require('fs');
var gm = require('gm');
var path = require('path');
var settings = require('../settings');
var utility = require('./utility');
var User = require('../models/user');

var processUpload = function(file) {
        var type = file.type;
        var size = file.size;
        if ((type != 'image/jpeg' && type != 'image/png') || (!size || size > 10*1024*1024)) {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.log('cannot remove [%s]', file.path);
            }
        } else {
            var str = utility.generateRandomString() + Date.now();
            var ext = type == 'image/jpeg' ? '.jpg' : '.png';
            var newpath = path.join(settings.uploadPath, 'image', str + ext);
            var thumb = path.join(settings.uploadPath, 'thumb', str + ext);
            try {
                fs.renameSync(file.path, newpath);
                gm(newpath).resize(500).quality(60).write(thumb, function(err) { });
                var imagepath = str + ext;
            } catch (err) {
                console.log('cannot rename [%s] to [%s]', files[i].path, newpath);
                console.log(err);
            }
        }
    return imagepath;
}


function setSessionLogin(req, user) {
    req.session.user = {
        isLogin: true,
        name: user.name,
        privilege: user.privilege,
        studentID: user.contact.studentID,
        wechat: user.contact.wechat,
        qq: user.contact.qq,
        phone: user.contact.phone,
        image: user.contact.image
    };
};

exports.showRegister = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    var info = utility.prepareRenderMessage(req);
    info.form = req.body.form || {};
    info.title = "Register";
    res.render('user_register', info);
};

exports.execRegister = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    res.locals.message = res.locals.message || [];
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.form = req.body;
        info.title = "Register";
        return res.render('user_register', info);
    }
    if (!req.body.password)
        return fallback(['密码不能为空']);
    if (req.body.password!=req.body.password2)
        return fallback(['两次密码输入不一致']);
        if (req.body.phone.length!=11)
                return fallback(['手机号码输入不正确'])
    if (req.body.wechat=="" && req.body.qq=="")
                return fallback(['微信和QQ请至少填写一个']);
        if (req.body.phone=="")
                return fallback(['请填写电话号码'])
    var imagedefault = "default3.jpg"
    if (typeof(req.files.image) !== 'undefined') {
        var imagepath = processUpload(req.files.image);
    }    

    var info = {
        name: req.body.name,
        privilege: "user",
        password: settings.hashPassword(req.body.password || ''),
        contact: {
            studentID: req.body.studentID,
            wechat: req.body.wechat,
            qq: req.body.qq,
            phone: req.body.phone,
            image: imagepath || imagedefault
        }
    };
    if ( info.contact.image !== 'default3.jpg') {
        info.privilege="tostaruser";
    }
    var item = new User(info);
    item.save(function(err) {
        if (err) return fallback(['该用户名已被使用']);
        setSessionLogin(req, info);
        res.redirect('/');
    })
};

exports.showLogin = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    var info = utility.prepareRenderMessage(req);
    info.form = req.body.form || {};
    info.title = "Login";
    res.render('user_login', info);
};

exports.execLogin = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    res.locals.message = res.locals.message || [];
    var name = req.body.name;
    var password = settings.hashPassword(req.body.password);
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.form = req.body;
        info.title = "Login";
        return res.render('user_login', info);
    }

    User.findOne({name: name}, function(err, found) {
        if (err || !found || found.password != password)
            return fallback(['用户名或密码错误']);
        setSessionLogin(req, found);
        res.redirect('/');
    });
};

exports.execLogout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/'); 
    });
}

exports.showModify = function(req, res) {
    if (!req.session.user.isLogin) res.redirect('/');
    var info = utility.prepareRenderMessage(req);
    info.form = req.body.form || {};
    info.title = "Modify User";
    res.render('user_modify', info);
};

exports.execModify = function(req, res) {
    if (!req.session.user.isLogin) res.redirect('/');
    res.locals.message = res.locals.message || [];
    var oldpasswd = settings.hashPassword(req.body.oldPassword || '');

    if (typeof(req.files.image) !== 'undefined') {
        var imagepath = processUpload(req.files.image);
        if (req.session.user.image !== 'default.jpg'){
            var oldpath = path.join(settings.uploadPath, 'image', req.session.user.image);
            var oldthumb = path.join(settings.uploadPath, 'thumb', req.session.user.image);
            try {
                fs.unlinkSync(oldpath);
                fs.unlinkSync(oldthumb);
            } catch (err) {
                console.log('cannot remove [%s]', oldpath);
            }
        }

    }    
    var info = {
        password: oldpasswd,
        name: req.session.user.name,
        privilege: req.session.user.privilege,
        contact: {
            studentID: req.body.studentID,
            wechat: req.body.wechat,
            qq: req.body.qq,
            phone: req.body.phone,
            image: imagepath || req.session.user.image
        }
    };

    if ( info.contact.image !== 'default.jpg' ) {
        info.privilege="tostaruser";
    }
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.form = req.body;
        info.title = "Modify User";
        return res.render('user_modify', info);
    }
        
    if (req.body.phone.length!=11)
        return fallback(['手机号码输入不正确'])
    if (req.body.wechat=="" && req.body.qq=="")
        return fallback(['微信和QQ请至少填写一个']);
    if (req.body.phone=="")
        return fallback(['请填写电话号码'])

    User.findOne({name: req.session.user.name}, function(err, doc) {
        if (err) return fallback(['Database failure']);
        if (!doc || doc.password != oldpasswd) return fallback(['原密码错误']);

        User.findOneAndUpdate({name: req.session.user.name}, info, function(err) {
            if (err) return fallback([err]);
            setSessionLogin(req, info);
            res.redirect('/');
        });
    });
};

exports.showList = function(req, res) {
    if (req.session.user.privilege !== 'administrator') res.redirect('/');
    var condition = {};
    switch (req.query.privilege) {
        case 'user': condition.privilege = 'user'; break;
        case 'tostaruser': condition.privilege = 'tostaruser'; break;
        case 'staruser': condition.privilege = 'staruser'; break;
        case 'failstaruser': condition.privilege = 'failstaruser'; break;
    }
    if (req.query.name)
        condition.name = req.query.name;
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        return res.redirect('/');
    }
    User.find(condition).count(function(err, count) {
        if (err) return fallback(['Database Failure']);
        var page = Number(req.query.page || '1');
        var skip = settings.perpage * (page-1);
        User.find(condition).sort('registerDate').skip(skip).limit(settings.perpage).exec(function(err, userList) {
            if (err) fallback('Database Failure');
            var info = utility.prepareRenderMessage(req);
            info.page = page;
            info.userList = userList;
            info.condition = condition;
            info.totpage = Math.ceil(count / settings.perpage);
            if (!info.condition.privilege) info.condition.privilege = '';
            if (!info.condition.name) info.condition.name = '';

            info.title = "";
            if (info.condition.name)
                info.title = info.condition.user + "'s Information";

            return res.render('user_list', info);
        });
    });
};

exports.star = function(req, res) {
if (req.session.user.privilege !== 'administrator') res.redirect('/');
    var condition = {};
    if (req.query.name)
        condition.name = req.query.name;
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        return res.redirect('/');
    }
    User.findOneAndUpdate({name: condition.name}, {privilege: 'staruser'},function(err) {
        if (err) return fallback([err]);
    });

};

exports.failstar = function(req, res) {
if (req.session.user.privilege !== 'administrator') res.redirect('/');
    var condition = {};
    if (req.query.name)
        condition.name = req.query.name;
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        return res.redirect('/');
    }
    User.findOneAndUpdate({name: condition.name}, {privilege: 'failstaruser'},function(err) {
        if (err) return fallback([err]);
    });

};

exports.execDelete = function(req, res) {
if (req.session.user.privilege !== 'administrator') res.redirect('/');
    var condition = {};
    if (req.query.name)
        condition.name = req.query.name;
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        return res.redirect('/');
    }
    try {
        var oldpath = path.join(settings.uploadPath, doc.contact.image);
        var oldthumb = path.join(settings.uploadPath, 'thumb', doc.contact.image);
        fs.unlinkSync(oldpath);
        fs.unlinkSync(oldthumb);
    } catch (err) {
        console.log('cannot remove [%s]', oldpath);
    }

    User.findOneAndRemove({name: condition.name}, function(err) {
        if (err) return fallback([err]);
    });
};

exports.execResetpasswd = function(req, res) {
    if (req.session.user.privilege !== 'administrator') res.redirect('/');
    var condition = {};
    if (req.query.name)
        condition.name = req.query.name;
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        return res.redirect('/');
    }
    User.findOneAndUpdate({name: condition.name}, {password: 'cee276eb20569a9cbf00527e75544f3da4d89e8c0e0685332ddf961d74be5f5cb6a49b21c8ad3134a9556774c2ddf7403f3e079459eae7833022afe89c6e70a2'}, function(err) {
        if (err) return fallback([err]);
    });
};

exports.showPasswd = function(req, res) {
    if (!req.session.user.isLogin) res.redirect('/');
    var info = utility.prepareRenderMessage(req);
    info.form = req.body.form || {};
    info.title = "Change Password";
    res.render('user_passwd', info);
};

exports.execPasswd = function(req, res) {
    if (!req.session.user.isLogin) res.redirect('/');
    res.locals.message = res.locals.message || [];
    var oldpasswd = settings.hashPassword(req.body.oldPassword || '');
    var newpasswd = req.body.newPassword ? settings.hashPassword(req.body.newPassword) : oldpasswd;

    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.form = req.body;
        info.title = "Change password";
        return res.render('user_passwd', info);
    }

    if (req.body.newPassword!=req.body.newPassword2)
        return fallback(['新密码两次输入不一致']);

    User.findOne({name: req.session.user.name}, function(err, doc) {
        if (err) return fallback(['Database failure']);
        if (!doc || doc.password != oldpasswd) return fallback(['原密码错误']);

        User.findOneAndUpdate({name: req.session.user.name}, {password: newpasswd}, function(err) {
            if (err) return fallback([err]);

            res.redirect('/');
        });
    });
};
