
// 载入 app 启动时的环境变量
require('./env');

// 一些必须的引用
var express     = require('express');
var path        = require('path');
var ejs         = require('ejs');
var partials    = require('express-partials');
var session     = require('express-session');
var RedisStore  = require('connect-redis')(session);
var favicon     = require('serve-favicon');
var morgan      = require('morgan');
var compression = require('compression');
var bodyParser  = require('body-parser');
var methodOverride  = require('method-override');
var cookieParser    = require('cookie-parser');
var flash           = require('connect-flash');
var errorhandler    = require('errorhandler');
var http            = require('http');
var timeout         = require('connect-timeout');

// 框架模块
var route       = _require('frame/route');
var staticPath  = _require('frame/static');

var file        = _require('util/file');
var util        = _require('util/util');

// 引用模块
var app     = module.exports = express();
var sEnv    = global.appEnv = app.get('env');
var bIsPro  = sEnv === 'production';
var bIsDev  = sEnv === 'development';

// 端口
app.set('port', process.env.PORT || 3000);

// 指定模板引擎，用.html是因为有高亮，呵呵
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
partials.register('.html', ejs);
app.use(partials());

// 线上去掉多余的空行
if (true || bIsPro) {
    var fEjsRender = ejs.render;
    ejs.render = function (str, options) {
        options.compileDebug = false;
        var sResult = fEjsRender.call(ejs, str, options);
        sResult = sResult.replace(/>(\s+)</gim, function () {
            return '><';
        });
        return sResult;
    }
}

// 一些解析
app.use(timeout(120000));
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(morgan('dev'));
app.use(compression());
app.use(bodyParser({limit: '1mb'}));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    store: new RedisStore({
        host: nConf.redis.host,
        port: nConf.redis.port,
        db: nConf.redis.session,
    }),
    secret: nConf.auth.secret,
    cookie: {maxAge: nConf.auth.sessionMaxAge}
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// 添加一些常用的变量
app.use(function (req, res, next) {
    res.locals._require = _require;
    res.locals.session  = req.session;
    res.locals.flash    = req.flash();
    res.locals.baseUrl  = req.url;
    res.locals.query    = req.query || {};
    res.locals.isAdmin  = req.session.user && req.session.user.isAdmin;
    res.locals.staticUrl = function (sUrl) {
        return nConf.front.staticUrl + '/' + sUrl.replace(/^\//, '');
    }
    next();
});

// 模板缓存
// 1、避免重复读取文件
// 2、避免重复生成模板渲染方法
if (bIsDev) {
    app.use(errorhandler());
} else if (bIsPro) {
    app.set('view cache', true);
}

// 登录用户的信息验证
var fFilterUser = _require('filters/user');
app.use(function (req, res, next) {
    fFilterUser(req, res, next).start();
});

// 设置MVC路由、静态路由
route(app, 'controllers', 'filters');
staticPath(app, 'static/');

// 404
app.use(function (req, res, next) {
    if (!!req.xhr) {
        res.json({code: -1, message: '404'});
    } else {
        res.render('status/404');
    }

    if (!bIsDev) {
        file.log(req.url + '\n 404');
    }
});

// 500
app.use(function (err, req, res, next) {
    var sMsg = err ? err.message || '' : '';
    sMsg += err && err.stack ? '\n\n' + err.stack : '';
    if (!bIsDev) {
        sMsg = '出现错误';
    }

    if (!!req.xhr) {
        res.json({code: -1, message: '500'});
    } else {
        res.render('status/500', {msg: sMsg, isDev: bIsDev});
    }

    if (!bIsDev) {
        file.log(req.url + '\n' + sMsg);
    }
});

// 自动重启
if (!module.parent) {
    http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });
}
