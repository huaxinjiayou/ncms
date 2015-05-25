
var action = _require('services/action');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostActionDel))
}

function fPostActionDel(req, res, next) {
    var that = this;
    var sObjType = that.body.type;
    var sObjId = that.body.id;

    sObjType = sObjType === 'rp' ? 'relationpost' : sObjType;

    if (sObjType !== 'book' &&
        sObjType !== 'post' &&
        sObjType !== 'note' &&
        sObjType !== 'relationpost') {
        that.render500('错误的参数');
        return;
    }

    var obj = action.service(sObjType);
    var oItem = $await(obj.findObjById(sObjType, sObjId));
    if (!obj || !oItem) {
        that.render500('错误的参数');
        return;
    }

    $await(obj.removeById(that.user, sObjId));
    that.json();
}