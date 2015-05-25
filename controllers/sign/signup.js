
var uri = _require('frame/uri');
var string = _require('util/string');
var user = _require('services/user');
var mail = _require('services/mail');

module.exports = {
    filter: ['nologin'],
    get: eval(windAsync(fGetSignUp)),
    post: eval(windAsync(fPostSignUp))
}

function fGetSignUp(req, res, next) {
    var that = this;
    that.render('site/sign/signup');
}

function fPostSignUp(req, res, next) {
    var that = this;
    var sEmail = that.body.email;
    var sPassword = that.body.password;
    var sRepwd = that.body.repwd;
    that.flash('email', sEmail);

    if (!sEmail || sPassword !== sRepwd) {
        that.alert('注册信息不完整', true);
        that.redirect(uri.signup);
        return;
    }

    if (sPassword !== sRepwd) {
        that.alert('密码不一致', true);
        that.redirect(uri.signup);
        return;
    }

    if (!string.isEmail(sEmail)) {
        that.alert('请填写正确的邮箱地址，以便用于接收验证邮件', true);
        that.redirect(uri.signup);
        return;
    }

    var bExist = $await(user.existEmail(sEmail));
    if (bExist) {
        that.alert('该邮箱地址已经注册', true);
        that.redirect(uri.signup);
        return;
    }

    var oUser = $await(user.register(sEmail, sPassword));
    that.redirect(uri.signSended);

    // 发送验证邮件
    $await(mail.sendSignup(oUser));
}