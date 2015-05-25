
var action = _require('services/action');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostActionUnLike))
}

function fPostActionUnLike(req, res, next) {
    var that = this;
    var sObjType = that.body.type;
    var sObjId = that.body.id;

    var obj = action.service(sObjType);
    var oItem = $await(obj.findObjById(sObjType, sObjId));
    if (!obj || !oItem) {
        that.render500('错误的参数');
        return;
    }

    $await(action.cancel(that.user, sObjType, sObjId, action.actionType.like));
    that.json();
}