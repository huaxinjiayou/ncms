
var _ = require('underscore');
var user = _require('services/user');
var uri = _require('frame/uri');

module.exports = {
    get: {
        filter: ['login', 'profiledata'],
        action: eval(windAsync(fGetProfileRepwd))
    },
    post: eval(windAsync(fPostProfileRepwd))
};

function fGetProfileRepwd(req, res, next) {
    var that = this;
    var oProfileData = that.profileData;
    that.setUpToken();

    that.render('site/profile/repwd',  _.extend({}, oProfileData, {
        isSelf: true
    }));
}

function fPostProfileRepwd(req, res, next) {
    var that = this;
    var oUser = that.user;
    var sPassword = that.body.password.trim();
    var sNewPwd = that.body.newpwd.trim();
    var sRepwd = that.body.repwd.trim();

    if (!sPassword || !sNewPwd || !sRepwd) {
        that.alert('信息不完整', true);
    } else if (sNewPwd !== sRepwd) {
        that.alert('新密码和重复密码不一致', true);
    } else if (sPassword === sNewPwd) {
        that.alert('新旧密码不能相同', true);
    } else if (!user.isPasswordRight(oUser, sPassword)) {
        that.alert('原密码错误', true);
    } else {
        $await(user.updatePassword(oUser.email, sNewPwd));
        var oNewUser = $await(user.findById(oUser.id));
        req.session.user = oNewUser;
        that.alert('密码修改成功');
    }
    
    return res.redirect(uri.profile(null, 'repwd'));
}