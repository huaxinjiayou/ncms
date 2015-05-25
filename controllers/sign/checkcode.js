
var _ = require('underscore');
var string = _require('util/string');
var uri = _require('frame/uri');
var user = _require('services/user');

module.exports = {
    route: '/sign/check/:code',
    filter: ['nologin'],
    get: eval(windAsync(fGetSignCheckCode))
}

function fGetSignCheckCode(req, res, next) {
    var that = this;
    var sCode = that.params.code.trim();
    var oUser = $await(user.findByCode(sCode));

    if (!oUser) {
        that.render('site/sign/codeerr');
        return;
    }

    // 已经验证
    var oFilter = user.filter();
    oFilter.data('isEmailVerify', true);
    oFilter.cond('id', oUser.id);
    $await(user.update(oFilter));

    // 重新登录吧
    that.flash('email', oUser.email);
    that.alert('很高兴您成为 360读者 的一员，请登录后体验 360读者 为您提供的更多服务。');
    that.redirect(uri.signin);
}
