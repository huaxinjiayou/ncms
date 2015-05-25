
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/count');

clazz.mix(Service, Base, null, {
    initialize: fCountInitialize,
    actionType: {
        view: 'view',
        like: 'like',
        collect: 'collect'
    },
    log: eval(windAsync(fCountLog)),
    reduce: eval(windAsync(fCountReduce)),
    count: eval(windAsync(fCountCount)),
    val: eval(windAsync(fCountVal))
});
module.exports = new Service(oModel);

function fCountInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fCountLog(sObjType, sObjId, sActionType) {
    var that = this;
    sObjId = util.id(sObjId);
    if (!sObjType || !sObjId || !sActionType) {
        return;
    }

    var oCount = $await(that.first({
        objType: sObjType,
        objId: sObjId,
        actionType: sActionType
    }));

    if (!oCount) {
        oCount = $await(that.create(null, {
            objType: sObjType,
            objId: sObjId,
            actionType: sActionType,
            val: 1
        }));
    } else {
        var oFilter = that.filter();
        oFilter.cond('id', oCount.id);
        oFilter.data('val', oCount.val + 1);
        $await(that.update(oFilter));
        oCount.val += 1;
    }

    return oCount;
}

function fCountReduce(sObjType, sObjId, sActionType) {
    var that = this;
    sObjId = util.id(sObjId);
    if (!sObjType || !sObjId || !sActionType) {
        return;
    }

    var oCount = $await(that.first({
        objType: sObjType,
        objId: sObjId,
        actionType: sActionType
    }));

    if (!oCount) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('id', oCount.id);
    oFilter.data('val', Math.max(0, oCount.val - 1));
    $await(that.update(oFilter));
}

function fCountCount(sObjType, aObjId, sActionType) {
    var that = this;
    if (!aObjId) {
        return;
    }
    
    if (!util.isArray(aObjId)) {
        var oCount = $await(that.first({
            objType: sObjType,
            objId: aObjId,
            actionType: sActionType
        }, true));
        return oCount;
    }

    var aAction = $await(that.find({
        objType: sObjType,
        objId: aObjId,
        actionType: sActionType
    }));
    var oActionMap = {};
    var aResult = [];
    for (var i = 0, l = aAction.length; i < l; i++) {
        oActionMap[aAction[i].objId] = aAction[i];
    }
    for (var i = 0, l = aObjId.length; i < l; i++) {
        aResult.push(oActionMap[aObjId[i]] || null);
    }
    return aResult;
}

function fCountVal(sObjType, aObjId, sActionType) {
    var that = this;
    if (!aObjId) {
        return;
    }
    
    var oFilter = that.filter();
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', aObjId);
    oFilter.cond('actionType', sActionType);
    oFilter.attr('val, objId');

    if (!util.isArray(aObjId)) {
        var oCount = $await(that.first(oFilter, true));
        return oCount ? oCount.val : 0;
    }

    var aAction = $await(that.find(oFilter, true));
    var oActionMap = {};
    var aResult = [];
    aAction.forEach(function (oItem) {
        oActionMap[oItem.objId] = oItem;
    });
    aObjId.forEach(function (sObjId) {
        aResult.push(oActionMap[sObjId] ? oActionMap[sObjId].val : 0);
    });
    return aResult;
}
