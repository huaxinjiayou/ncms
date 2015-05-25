
var _ = require('underscore');
var string = _require('util/string');
var uri = _require('frame/uri');
var user = _require('services/user');
var mail = _require('services/mail');

module.exports = {
    filter: ['nologin'],
    get: eval(windAsync(fGetSignSend)),
    post: eval(windAsync(fPostSignSend))
}

function fGetSignSend(req, res, next) {
    var that = this;
    that.render('site/sign/send');
}

function fPostSignSend(req, res, next) {
    var that = this;

    var sEmail = that.body.email;
    var sPassword = that.body.password;
    that.flash('email', sEmail);

    if (!sEmail || !string.isEmail(sEmail)) {
        that.alert('请填写正确的邮箱地址，以便用于接收验证邮件', true);
        that.redirect(uri.signSend);
        return;
    }

    var oUser = $await(user.login(sEmail, sPassword));
    if (!oUser) {
        that.alert('账号或者密码不正确，请检查', true);
        that.redirect(uri.signSend);
        return;
    }

    if (oUser.isDel) {
        that.alert('该账号已经注销', true);
        that.redirect(uri.signSend);
        return;
    }

    if (oUser.isEmailVerify) {
        that.alert('该账号已经通过邮箱验证，欢迎回来');
        that.login(oUser);
        that.redirect('/');
        return;
    }

    that.redirect(uri.signSended);

    // 重新更新验证码，然后发送验证邮件
    oUser = $await(user.updateCode(sEmail));
    $await(mail.sendSignup(oUser));
}