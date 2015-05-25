
var user = _require('services/user');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fUpdateProfile))
};

function fUpdateProfile(req, res, next) {
    var that = this;
    var sUid = util.id(req.session.user);
    var oData = {
        name: fGetVal(req.body.name),
        nickname: fGetVal(req.body.nickname),
        qq: fGetVal(req.body.qq),
        description: fGetVal(req.body.description),
        gender: fGetVal(req.body.gender),
        avatar: fGetVal(req.body.avatar)
    };
    
    // 更新数据
    var oFilter = user.filter();
    oFilter.data(oData);
    oFilter.cond('id', sUid);
    $await(user.update(oFilter));

    var oUser = $await(user.findById(sUid));
    that.login(oUser);
    that.json();
}

function fGetVal(sVal) {
    return sVal && sVal.trim() ? sVal.trim() : undefined;
}