/* global _require */

var _ = require('underscore');
var qn = require('qn');
var uri = _require('frame/uri');
var clazz = _require('util/class');
var string = _require('util/string');
var util = _require('util/util');
var Handler = module.exports = clazz.create();

_.extend(Handler.prototype, {
    initialize: fHandlerInitialize,

    flash: fHandlerFlash,
    alert: fHandlerAlert,

    render: fHandlerRender,
    redirect: fHandlerRedirect,
    redirectLogin: fHandlerRedirectLogin,

    setUpToken: fHandlerSetUpToken,
    hasPermission: fHandlerHasPermission,

    json: fHandlerJson,
    jsonErr: fHandlerJsonErr,

    render500: fHandlerRender500,

    login: fHandlerLogin,
    logout: fHandlerLogout
});


function fHandlerInitialize(req, res, next) {
    var that = this;

    // 获取一些引用
    that.req = req;
    that.res = res;
    that.body = req.body;
    that.query = req.query;
    that.params = req.params;

    // 一些处理
    that.isAjax = !!that.req.xhr;
    that.user = req.session.user;
    that.isAdmin = that.user && that.user.isAdmin;
}

function fHandlerFlash(sKey, sVal) {
    if (!sKey) {
        return;
    }
    this.req.flash(sKey, sVal);
}

function fHandlerAlert(sMsg, bError) {
    this.flash(bError ? 'error' : 'note', sMsg);
}

function fHandlerRender() {
    var that = this;
    that.res.render.apply(that.res, arguments);
}

function fHandlerRedirect(sUrl) {
    var that = this;
    sUrl = sUrl || that.req.headers.referer || '/';
    that.res.redirect(sUrl);
}

function fHandlerRedirectLogin() {
    var that = this;
    that.redirect(uri.signin);
}

function fHandlerSetUpToken() {
    var that = this;
    var oQnConf = nConf.qiniu;

    if (!Handler.client) {
        Handler.client = qn.create({
            accessKey: oQnConf.accessKey,
            secretKey: oQnConf.secretKey,
            bucket: oQnConf.bucket,
            domain: oQnConf.bucket + '.qiniudn.com'
        });
    }
    var oClient = Handler.client;
    var sToken = oClient.uploadToken({
        returnBody: '{"code":0,"message":"操作成功","data":{"bucket":$(bucket),"key":$(etag),"name":$(fname),"size":$(fsize),"type":$(mimeType),"imageInfo":$(imageInfo)}}'
    });

    that.res.locals.upToken = sToken;
}

function fHandlerHasPermission(oItem) {
    var that = this;
    return oItem && !oItem.isDel && util.id(oItem.userId) === util.id(that.user);
}

function fHandlerUser() {
    var that = this;
    return req.session.user || null;
}

function fHandlerJson(oData) {
    var that = this;
    oData = oData ? oData.data || oData : null;
    that.res.json({
        code: 0,
        message: '操作成功',
        data: oData
    });
}

function fHandlerJsonErr(sMsg, nCode) {
    var that = this;
    this.res.json({
        code: nCode || -1,
        message: sMsg || '出现错误'
    });
}

function fHandlerRender500(sMsg) {
    var that = this;
    if (that.isAjax) {
        return that.jsonErr('出现错误');
    }
    
    that.res.render('status/500', {
        msg: sMsg || '出现错误'
    });
}

function fHandlerLogin(oUser) {
    var that = this;
    var sUid = util.id(oUser);

    // 先退出登录，然后保存登录信息
    that.logout();
    var sAuthToken = string.encrypt(sUid + '|' + oUser.salt, nConf.auth.secret);
    that.res.cookie(nConf.auth.cookieName, sAuthToken, {path: '/', maxAge: nConf.auth.cookieMaxAge});
}

function fHandlerLogout() {
    var that = this;
    that.req.session.destroy();
    that.res.clearCookie(nConf.auth.cookieName, {path: '/'});
}
