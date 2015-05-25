
var _ = require('underscore');
var string = _require('util/string');
var uri = _require('frame/uri');
var user = _require('services/user');
var mail = _require('services/mail');

module.exports = {
    filter: ['nologin'],
    get: eval(windAsync(fGetSignForgetPwd)),
    post: eval(windAsync(fPostSignForgetPwd))
}

function fGetSignForgetPwd(req, res, next) {
    var that = this;
    that.render('site/sign/forgetpwd');
}

function fPostSignForgetPwd(req, res, next) {
    var that = this;

    var sEmail = that.body.email;
    that.flash('email', sEmail);

    if (!sEmail || !string.isEmail(sEmail)) {
        that.alert('请填写正确的邮箱地址，以便用于接收验证邮件', true);
        that.redirect(uri.signForgetPwd);
        return
    }

    // 直接跳转
    var oUser = $await(user.findByEmail(sEmail));
    that.redirect(uri.signSendedPwd);

    if (!oUser || oUser.isDel) {
        return;
    }

    oUser = $await(user.updateCode(sEmail));
    $await(mail.sendForgetPwd(oUser));
}