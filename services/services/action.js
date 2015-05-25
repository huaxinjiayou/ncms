
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/action');

clazz.mix(Service, Base, null, {
    actionType: {
        like: 'like',
        collect: 'collect',
        view: 'view'
    },

    initialize: fActionInitialize,

    isAction: eval(windAsync(fActionIsAction)),
    action: eval(windAsync(fActionAction)),
    cancel: eval(windAsync(fActionCancel)),
    log: eval(windAsync(fActionLog)),
    user: eval(windAsync(fActionUser))
});
module.exports = new Service(oModel);

function fActionInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fActionIsAction(oUser, sObjType, aObjId, sActionType) {
    var that = this;
    var sUid = util.id(oUser);
    if (!sUid || !sObjType || !aObjId || aObjId.length === 0 || !sActionType) {
        return false;
    }

    if (!util.isArray(aObjId)) {
        var bExist = $await(that.exist({
            userId: sUid,
            objType: sObjType,
            objId: aObjId,
            actionType: sActionType,
            isDel: false
        }));
        return bExist;
    }

    // 只查询一次
    var oFilter = that.filter();
    oFilter.cond('userId', sUid);
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', aObjId);
    oFilter.cond('actionType', sActionType);
    oFilter.attr('objId');
    var aResult = $await(that.find(oFilter));
    var oResultMap = {};
    for (var i = 0, l = aResult.length; i < l; i++) {
        oResultMap[aResult[i].objId] = true;
    }

    aResult.length = 0;
    for (var i = 0, l = aObjId.length; i < l; i++) {
        aResult.push(!!oResultMap[aObjId[i]]);
    }
    return aResult;
}

function fActionAction(oUser, sObjType, sObjId, sActionType) {
    var that = this;
    var sUid = util.id(oUser);
    sObjId = util.id(sObjId);

    if (!sUid || !sObjType || !sObjId || !sActionType) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('userId', sUid);
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', sObjId);
    oFilter.cond('actionType', sActionType);
    oFilter.order('createdAt desc');
    oFilter.attr('id,isDel');
    var oAction = $await(that.first(oFilter, true));
    if (oAction && !oAction.isDel) {
        return;
    }

    if (oAction) {
        oFilter = that.filter();
        oFilter.cond('id', oAction.id);
        oFilter.data('isDel', false);
        $await(that.update(oFilter));
    } else {
        $await(that.create(oUser, {
            userId: sUid,
            objType: sObjType,
            objId: sObjId,
            actionType: sActionType
        }));
    }

    // 增加数量
    var count = _require('services/count');
    $await(count.log(sObjType, sObjId, sActionType));
}

function fActionCancel(oUser, sObjType, sObjId, sActionType) {
    var that = this;
    var sUid = util.id(oUser);
    sObjId = util.id(sObjId);

    if (!sUid || !sObjType || !sObjId || !sActionType) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('userId', sUid);
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', sObjId);
    oFilter.cond('actionType', sActionType);
    oFilter.attr('id,isDel');
    var oAction = $await(that.first(oFilter, true));
    if (!oAction || oAction.isDel) {
        return;
    }

    oFilter = that.filter();
    oFilter.cond('id', oAction.id);
    oFilter.data('isDel', true);
    $await(that.update(oFilter));

    // 增加数量
    var count = _require('services/count');
    $await(count.reduce(sObjType, sObjId, sActionType));
}

function fActionLog(oUser, sObjType, sObjId, sActionType, nDuration) {
    var that = this;
    var sUid = util.id(oUser);
    sObjId = util.id(sObjId);
    nDuration = +nDuration || 86400000;

    if (!sUid || !sObjType || !sObjId || !sActionType) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('userId', sUid);
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', sObjId);
    oFilter.cond('actionType', sActionType);
    oFilter.order('createdAt desc');
    oFilter.attr('createdAt');
    var oAction = $await(that.first(oFilter, true));

    if (oAction) {
        var nActionTime = new Date(oAction.createdAt).getTime();
        var nNowTime = new Date().getTime();
        if (nNowTime - nActionTime < nDuration) {
            return;
        }
    }

    $await(that.create(oUser, {
        userId: sUid,
        objType: sObjType,
        objId: sObjId,
        actionType: sActionType
    }));

    // 增加数量
    var count = _require('services/count');
    $await(count.log(sObjType, sObjId, sActionType));
}

function fActionUser(sObjType, sObjId, sActionType, nLimit, sOrder, bIncludeTime) {
    var that = this;
    sObjId = util.id(sObjId);

    if (!sObjType || !sObjId || !sActionType) {
        return {user: [], time: []};
    }

    var oFilter = that.filter();
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', sObjId);
    oFilter.cond('actionType', sActionType);
    if (sOrder) {
        oFilter.order(sOrder);
    }

    if (nLimit) {
        oFilter.limit(nLimit);
    }

    oFilter.attr('userId, updatedAt');
    var aAction = $await(that.find(oFilter));
    if (!aAction || aAction.length === 0) {
        return bIncludeTime ? {user: [], time: []} : [];
    }

    var aTime = [];
    var aUserId = [];
    aAction.forEach(function (oItem) {
        aUserId.push(oItem.userId);
        aTime.push(oItem.updatedAt);
    });

    var user = _require('services/user');
    var aUser = $await(user.findById(aUserId));

    // 重新排序
    var oUserMap = {};
    aUser.forEach(function (oItem) {
        oUserMap[oItem.id] = oItem;
    });
    aUser.length = 0;
    for (var i = 0, l = aUserId.length; i < l; i++) {
        if (oUserMap[aUserId[i]]) {
            aUser.push(oUserMap[aUserId[i]]);
        }
    }
    return bIncludeTime ? {user: aUser, time: aTime} : aUser;
}
