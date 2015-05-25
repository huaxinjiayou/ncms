
var uri = _require('frame/uri');
var string = _require('util/string');
var user = _require('services/user');

module.exports = {
    get: {
        route: '/sign/repwd/:code',
        filter: ['nologin'],
        action: eval(windAsync(fGetSignRepwd))
    },
    post: eval(windAsync(fPostSignRepwd))
}

function fGetSignRepwd(req, res, next) {
    var that = this;
    var sCode = that.params.code;
    var oUser = $await(user.findByCode(sCode));
    if (!oUser) {
        that.alert('验证码不存在或者已经过期', true);
        that.redirect(uri.signForgetPwd);
        return;
    }

    that.render('site/sign/repwd', {
        email: oUser.email,
        code: sCode
    });
}

function fPostSignRepwd(req, res, next) {
    var that = this;
    var sEmail = that.body.email.trim();
    var sPassword = that.body.password.trim();
    var sRepwd = that.body.repwd.trim();
    var sCode = that.body.code.trim();
    var sUrl = '/sign/repwd/' + sCode;

    if (!sEmail || !sPassword || !sRepwd) {
        that.alert('信息不完整', true);
        that.redirect(sUrl);
        return;
    }

    if (sPassword !== sRepwd) {
        that.alert('密码不一致', true);
        that.redirect(sUrl);
        return;
    }

    if (!string.isEmail(sEmail)) {
        that.alert('请填写正确的邮箱地址', true);
        that.redirect(sUrl);
        return;
    }

    var oUser = $await(user.findByCode(sCode));
    if (!oUser) {
        that.alert('验证码不存在或者已经过期', true);
        that.redirect(uri.signForgetPwd);
        return;
    }

    // 更改密码和邮箱验证状态
    $await(user.updatePassword(sEmail, sPassword));
    var oFilter = user.filter();
    oFilter.cond('id', oUser.id);
    oFilter.data('isEmailVerify', true);
    $await(user.update(oFilter));

    that.alert('密码修改成功，请重新登录');
    that.flash('email', oUser.email);
    that.redirect(uri.signin);
}