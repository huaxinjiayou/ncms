
var uri = _require('frame/uri');
var string = _require('util/string');
var user = _require('services/user');

module.exports = {
    filter: ['nologin'],
    get: eval(windAsync(fGetSignIn)),
    post: eval(windAsync(fPostSignIn))
}

function fGetSignIn(req, res, next) {
    var that = this;
    that.render('site/sign/signin');
}

function fPostSignIn(req, res, next) {
    var that = this;
    var sEmail = that.body.email;
    var sPassword = that.body.password;
    that.flash('email', sEmail);

    if (!sEmail || !sPassword) {
        that.alert('登录信息不完整', true);
        that.redirect(uri.signin);
        return;
    }

    if (!string.isEmail(sEmail)) {
        that.alert('请填写正确的邮箱地址', true);
        that.redirect(uri.signin);
        return;
    }

    var oUser = $await(user.login(sEmail, sPassword));
    if (!oUser) {
        that.alert('账号或者密码不正确，请检查', true);
        that.redirect(uri.signin);
        return;
    }

    if (oUser.isDel) {
        that.alert('该账号已经注销', true);
        that.redirect(uri.signin);
        return;
    }

    if (!oUser.isEmailVerify) {
        that.alert('该账号暂未通过邮箱验证，无法登录', true);
        that.redirect(uri.signin);
        return;
    }

    that.login(oUser);
    that.redirect(uri.profile(oUser));
}