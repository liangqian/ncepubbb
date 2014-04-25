var fs = require('fs');
var gm = require('gm');
var path = require('path');
var settings = require('../settings');
var utility = require('./utility');
var Goods = require('../models/goods');
var User = require('../models/user');

var processUpload = function(files) {
    var pathList = [];
    for (var i = 0; i < files.length; ++i) {
        var type = files[i].type;
        var size = files[i].size;
        if ((type != 'image/jpeg' && type != 'image/png') || (!size || size > 10*1024*1024)) {
            try {
                fs.unlinkSync(files[i].path);
            } catch (err) {
                console.log('cannot remove [%s]', files[i].path);
            }
        } else {
            var str = utility.generateRandomString() + Date.now();
            var ext = type == 'image/jpeg' ? '.jpg' : '.png';
            var newpath = path.join(settings.uploadPath, str + ext);
            var thumb = path.join(settings.uploadPath, 'thumb', str + ext);
            try {
                fs.renameSync(files[i].path, newpath);
                //fs.renameSync(newpath, thumb);
                gm(newpath).resize(500).quality(60).write(thumb, function(err) { });
                pathList.push(str + ext);
            } catch (err) {
                console.log('cannot rename [%s] to [%s]', files[i].path, newpath);
                console.log(err);
            }
        }
    }
    return pathList;
}

exports.showNew = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    var info = utility.prepareRenderMessage(req);
    info.actionUrl = '/goods/new';
    info.form = {};
    info.form.fileCount = 1;
    info.title = "Add a goods";
    res.render('goods_new', info);
};

exports.execNew = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    res.locals.message = res.locals.message || [];
    var info = {
        title: req.body.title,
        content: req.body.content,
        tags: [],
        user: req.session.user.name,
        status: 'published',
        class: req.body.class,
        images: []
    };
    req.body.tags = req.body.tags ? req.body.tags : '';
    req.body.tags.split(',').forEach(function(item) {
        var tag = item.trim();
        if (tag) info.tags.push(tag);
    });
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.actionUrl = '/goods/new';
        info.form = req.body;
        info.form.fileCount = req.files.images.length || 1;
        info.title = "Add a goods";
        return res.render('goods_new', info);
    };

    if (!info.title || !info.content || !info.tags.length) {
        return fallback(['No field can be empty']);
    }
    var pathList = [];
    if (typeof(req.files) !== 'undefined' && typeof(req.files.images) !== 'undefined') {
        pathList = processUpload(req.files.images);
    }
    for (var i = 0; i < pathList.length; ++i) {
        info.images.push({ path: pathList[i] });
    }

    var item = new Goods(info);
    item.save(function(err, saved) {
        if (err) return fallback(['Unknown Error']);
        setTimeout(function(){res.redirect('/goods/' + saved.id);}, 1000);
    });
};

exports.showList = function(req, res) {
    var condition = {};
    switch (req.query.status) {
        case 'finished': condition.status = 'finished'; break;
        case 'published': condition.status = 'published'; break;
    }
    if (req.query.user)
        condition.user = req.query.user;
    if (req.query.tags)
        condition.tags = req.query.tags;
    if (req.query.class)
        condition.class = req.query.class;
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        return res.redirect('/');
    }
            var info = utility.prepareRenderMessage(req);
    Goods.find(condition).count(function(err, count) {
        if (err) return fallback(['Database Failure']);
        var page = Number(req.query.page || '1');
        var skip = settings.perpage * (page-1);
            if (req.query.user) {
                User.findOne({name: req.query.user}, function(err, found) {
                    if (err || !found) return res.redirect('/');

                    

        Goods.find(condition).sort('-postDate').skip(skip).limit(settings.perpage).exec(function(err, goodsList) {
            if (err) fallback('Database Failure');

            info.page = page;
            info.goods = goodsList;
            info.condition = condition;
            info.totpage = Math.ceil(count / settings.perpage);
            if (!info.condition.status) info.condition.status = '';
            if (!info.condition.user) info.condition.user = '';
            if (!info.condition.tags) info.condition.tags = '';
            if (!info.condition.class) info.condition.class = '';
            if (req.query.page) info.condition.page = req.query.page;
            if (!req.query.page) info.condition.page = "";
            info.title = "";
            if (info.condition.user)
                info.title = info.condition.user + "'s ";
            switch (info.condition.status) {
                case 'published': info.title += 'Selling'; break;
                case 'finished': info.title += 'Sold'; break;
                default: info.title += 'All'; break;
            }
            info.title += " Goods";
            if (info.condition.tags)
                info.title += ' of ' + info.condition.tags;
            info.title += '  Page ' + page;

            info.phone = found.contact.phone;
            info.wechat = found.contact.wechat;
            info.qq = found.contact.qq;



            return res.render('goods_list', info);
        });
                });
            }      
            else{
        Goods.find(condition).sort('-postDate').skip(skip).limit(settings.perpage).exec(function(err, goodsList) {
            if (err) fallback('Database Failure');
            var info = utility.prepareRenderMessage(req);
            info.page = page;
            info.goods = goodsList;
            info.condition = condition;
            info.totpage = Math.ceil(count / settings.perpage);
            if (!info.condition.status) info.condition.status = '';
            if (!info.condition.user) info.condition.user = '';
            if (!info.condition.tags) info.condition.tags = '';
            if (!info.condition.class) info.condition.class = '';
            if (req.query.page) info.condition.page = req.query.page;
            if (!req.query.page) info.condition.page = "";
            info.title = "";
            if (info.condition.user)
                info.title = info.condition.user + "'s ";
            switch (info.condition.status) {
                case 'published': info.title += 'Selling'; break;
                case 'finished': info.title += 'Sold'; break;
                default: info.title += 'All'; break;
            }
            info.title += " Goods";
            if (info.condition.tags)
                info.title += ' of ' + info.condition.tags;
            info.title += '  Page ' + page;

            info.phone = '';
            info.wechat = '';
            info.qq = '';




            return res.render('goods_list', info);
        });
          }
    });
};

exports.show = function(req, res) {
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (err || !doc) return res.redirect('/');
        var info = utility.prepareRenderMessage(req);
        info.goods = doc;
        info.title = doc.title;
        User.findOne({name: doc.user}, function(err, found) {
            if (err || !found) return res.redirect('/');
            info.phone = found.contact.phone;
            info.wechat = found.contact.wechat;
            info.qq = found.contact.qq;
            info.privilege = found.privilege;
            res.render('goods_show', info);
        });
        
    });
};

exports.showModify = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (doc.user !== req.session.user.name && req.session.user.privilege !== 'administrator')
            return res.redirect('/goods/' + id);
        var info = utility.prepareRenderMessage(req);
        info.goods = doc;
        info.goods.tags = doc.tags.join(', ');
        info.fileCount = 1;
        info.title = "[Modify]" + doc.title;
        res.render('goods_modify', info);
    });
};

exports.execModify = function(req, res) {
    if (!req.session.user.isLogin) return res.redirect('/user/login');
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (doc.user !== req.session.user.name && req.session.user.privilege !== 'administrator')
            return res.redirect('/goods/' + id);
        res.locals.message = res.locals.message || [];
        var info = {
            title: req.body.title,
            content: req.body.content,
            tags: [],
            user: doc.user,
            status: req.body.finished ? 'finished' : 'published',
            class: req.body.class,
            images: []
        };
        req.body.tags = req.body.tags ? req.body.tags : '';
        req.body.tags.split(',').forEach(function(item) {
            var tag = item.trim();
            if (tag) info.tags.push(tag);
        });
        var fallback = function(errors) {
            errors.forEach(function(err) {
                res.locals.message.push(err);
            });
            var info2 = utility.prepareRenderMessage(req);
            info2.actionUrl = '/goods/' + id + '/modify';
            info2.goods = info;
            info2.goods.images = doc.images;
            info2.fileCount = req.files.images.length || 1;
            info2.title = "[Modify]" + doc.title;
            return res.render('goods_modify', info2);
        };

        if (!info.title || !info.content || !info.tags.length) {
            return fallback(['No field can be empty']);
        }

        for (var i = 0; i < doc.images.length; ++i) {
            if (typeof(req.body.delete) !== 'object' || req.body.delete[i] !== 'yes') {
                info.images.push({ path: doc.images[i].path });
            }
            if (req.body.delete[i] === 'yes'){
                try {
                    var oldpath = path.join(settings.uploadPath, doc.images[i].path);
                    var oldthumb = path.join(settings.uploadPath, 'thumb', doc.images[i].path);
                    fs.unlinkSync(oldpath);
                    fs.unlinkSync(oldthumb);
                } catch (err) {
                    console.log('cannot remove [%s]', oldpath);
                }
            }

        }
        var pathList = [];
        if (typeof(req.files) !== 'undefined' && typeof(req.files.images) !== 'undefined') {
            pathList = processUpload(req.files.images);
        }
        for (var i = 0; i < pathList.length; ++i) {
            info.images.push({ path: pathList[i] });
        }

        Goods.findByIdAndUpdate(id, info, function(err) {
            if (err) return fallback(['Unknown Error']);
            setTimeout(function(){res.redirect('/goods/' + id);}, 1000);
        });
    });
};

exports.showDelete = function(req, res) {
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (err || !doc) return res.redirect('/');
        if (req.session.user.privilege != 'administrator' && req.session.user.name != doc.user)
            return res.redirect('/');
        var info = utility.prepareRenderMessage(req);
        info.goods = doc;
        info.title = "[Delete]" + doc.title;
        res.render('goods_delete', info);
    });
};

exports.execDelete = function(req, res) {
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (err || !doc) return res.redirect('/');
        if (req.session.user.privilege != 'administrator' && req.session.user.name != doc.user)
            return res.redirect('/');
        for (var i = 0; i < doc.images.length; ++i) {
            try {
                var oldpath = path.join(settings.uploadPath, doc.images[i].path);
                var oldthumb = path.join(settings.uploadPath, 'thumb', doc.images[i].path);
                fs.unlinkSync(oldpath);
                fs.unlinkSync(oldthumb);
            } catch (err) {
                console.log('cannot remove [%s]', oldpath);
            }
        }
        Goods.findByIdAndRemove(id, function(err) {
            return res.redirect('/goods');
        })
    });
};
exports.chstatus = function(req, res) {
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (err || !doc) return res.redirect('/');
        if (req.session.user.privilege != 'administrator' && req.session.user.name != doc.user)
            return res.redirect('/');
        if (doc.status == 'published') {
            Goods.findByIdAndUpdate(id, {status: 'finished'}, function(err) {
                if (err) return res.redirect('/');
                return res.redirect('/goods?status='+req.query.status+'&class='+req.query.class+'&user='+req.query.user+'&published='+req.query.published+'&tags='+req.query.tags+'&page='+req.query.page);
            })
        }
        if (doc.status == 'finished') {
            Goods.findByIdAndUpdate(id, {status: 'published'}, function(err) {
                if (err) return res.redirect('/');
                return res.redirect('/goods?status='+req.query.status+'&class='+req.query.class+'&user='+req.query.user+'&published='+req.query.published+'&tags='+req.query.tags+'&page='+req.query.page);
            })
        }
    });
};
/* try to ajax,but failed
exports.chstatusjson = function(req, res) {
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (err || !doc) return res.redirect('/');

        if (doc.status == 'published') {
            Goods.findByIdAndUpdate(id, {status: 'finished'}, function(err) {
                if (err) return res.redirect('/');
                res.json({
                    status: doc.status
                });
            })
        }
        if (doc.status == 'finished') {
            Goods.findByIdAndUpdate(id, {status: 'published'}, function(err) {
                if (err) return res.redirect('/');
                res.writeHead(200, { 'Content-Type': 'text/plain' });  
                res.end(temp.toString());  
                res.json({
                    status: doc.status
                });
            })
        }
    });
};
*/
exports.interest = function(req, res) {
    res.locals.message = res.locals.message || [];
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        return res.render('homepage', info)
        //return res.redirect('/goods?status='+req.query.status+'&class='+req.query.class+'&user='+req.query.user+'&published='+req.query.published+'&tags='+req.query.tags+'&page='+req.query.page);
    }
    if (!req.session.user.isLogin) return fallback(['登录用户才能点赞']);
    var id = req.params.id;
    Goods.findById(id, function(err, doc) {
        if (err || !doc) return res.redirect('/');
        for (var i = 0; i < doc.intenum; ++i) {
            if (req.session.user.name==doc.interest[i]) return fallback(['你已赞过此请求'])
        }
        var inte={
            intenum:0,
            interest: []
        };
        for (var i = 0; i < doc.intenum; ++i) {
            inte.interest.push(doc.interest[i]);
        }
        inte.interest.push(req.session.user.name)
        inte.intenum=doc.intenum+1

        Goods.findByIdAndUpdate(id, inte, function(err) {
                if (err) return fallback([err]);
                return res.redirect('/goods?status='+req.query.status+'&class='+req.query.class+'&user='+req.query.user+'&published='+req.query.published+'&tags='+req.query.tags+'&page='+req.query.page);
        })
    });
};