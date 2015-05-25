
var _ = require('underscore');
var user = _require('services/user');
var uri = _require('frame/uri');

module.exports = {
    get: {
        filter: ['login', 'profiledata'],
        action: eval(windAsync(fGetProfileInfo))
    },
    post: eval(windAsync(fPostProfileInfo))
};

function fGetProfileInfo(req, res, next) {
    var that = this;
    var oProfileData = that.profileData;
    that.setUpToken();

    that.render('site/profile/info', _.extend({}, oProfileData, {
        isSelf: true
    }));
}

function fPostProfileInfo(req, res, next) {
    var that = this;

    var sNickname = that.body.nickname.trim();
    var sQQ = that.body.qq.trim();
    var sDescription = that.body.description.trim();
    var sGender = (that.body.gender || '').trim();

    var oData = {
        nickname: sNickname || undefined,
        qq: sQQ || undefined,
        description: sDescription || undefined,
        gender: sGender || undefined
    };

    var oFilter = user.filter();
    oFilter.data('nickname', sNickname || undefined);
    oFilter.data('qq', sQQ || undefined);
    oFilter.data('description', sDescription || undefined);
    oFilter.data('gender', sGender || undefined);
    oFilter.cond('id', that.user.id);
    $await(user.update(oFilter));

    // 更新用户信息
    var oUser = $await(user.findById(that.user.id));
    req.session.user = oUser;

    that.alert('资料修改成功');
    that.redirect(uri.profile(null, 'info'));
}