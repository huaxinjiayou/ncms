
var util = _require('util/util');
var user = _require('services/user');

module.exports = eval(windAsync(fUser));

function fUser(req, res, next) {
    var that = this;
    
    var sUid = util.id(that.params.uid);
    var oUser = $await(user.findById(sUid));

    if (!oUser) {
        that.render500('不存在的用户');
        return;
    }

    that.profileUser = oUser;
    next();
}