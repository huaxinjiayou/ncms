
var _ = require('underscore');
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/relationtag');

clazz.mix(Service, Base, null, {
    initialize: fRelationTagInitialize,
    mapById: fRelationTagMapById,

    addTag: eval(windAsync(fRelationTagAddTag)),
    removeTag: eval(windAsync(fRelationTagRemoveTag)),
    hasTag: eval(windAsync(fRelationTagHasTag)),
    findObj: eval(windAsync(fRelationTagFindObj)),
    pageObj: eval(windAsync(fRelationTagPageObj))
});
module.exports = new Service(oModel);

function fRelationTagInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fRelationTagAddTag(sObjType, sObjId, sTagId) {
    var tag = _require('services/tag');
    var that = this;
    var bExistItem = $await(that.existObj(sObjType, sObjId));
    var oTag = $await(tag.findById(util.id(sTagId)));
    sObjId = util.id(sObjId);

    if (!bExistItem || !oTag) {
        return;
    }

    var oRelation = $await(that.first({
        objType: sObjType,
        objId: sObjId,
        tagId: oTag.id
    }, true));

    if (!oRelation) {
        $await(that.create(null, {
            objType: sObjType,
            objId: sObjId,
            tagId: oTag.id
        }));
    } else if (oRelation.isDel) {
        var oFilter = that.filter();
        oFilter.cond('id', oRelation.id);
        oFilter.data('isDel', false);
        $await(that.update(oFilter));
    }
}

// sTagId 可以省略
function fRelationTagRemoveTag(sObjType, sObjId, sTagId) {
    var tag = _require('services/tag');
    var that = this;
    var bExistItem = $await(that.existObj(sObjType, sObjId));
    var oTag = $await(tag.findById(util.id(sTagId)));
    sObjId = util.id(sObjId);

    if (!bExistItem) {
        return;
    }

    if (oTag) {
        var oRelation = $await(that.first({
            objType: sObjType,
            objId: sObjId,
            tagId: oTag.id
        }, true));

        if (!oRelation || oRelation.isDel) {
            return;
        }

        var oFilter = that.filter();
        oFilter.cond('id', oRelation.id);
        oFilter.data('isDel', true);
        $await(that.update(oFilter));
    } else {
        var oFilter = that.filter();
        oFilter.cond('objType', sObjType);
        oFilter.cond('objId', sObjId);
        oFilter.data('isDel', true);
        $await(that.update(oFilter));
    }
}

function fRelationTagHasTag(sObjType, aObjId, sTagId) {
    var that = this;
    var bIsArray = util.isArray(aObjId);
    sTagId = util.id(sTagId);

    if (!bIsArray) {
        aObjId = [aObjId];
    }

    if (!sTagId || !sObjType || !aObjId || (bIsArray && aObjId.length === 0)) {
        return bIsArray ? [] : false;
    }

    var oFilter = that.filter();
    oFilter.cond('objType', sObjType);
    oFilter.cond('objId', aObjId);
    oFilter.cond('tagId', sTagId);
    oFilter.attr('objId');
    var aRelation = $await(that.find(oFilter));
    var oRelationMap = {};
    var aResult = [];

    aRelation.forEach(function (oItem) {
        oRelationMap[oItem.objId] = true;
    });
    aObjId.forEach(function (sObjId) {
        aResult.push(!!oRelationMap[sObjId]);
    });

    return bIsArray ? aResult : aResult[0];
}

function fRelationTagFindObj(sTagId, sObjType, sOrder, nLimit) {
    var tag = _require('services/tag');

    var that = this;
    var obj = that.service(sObjType);
    var oTag = $await(tag.findById(sTagId));

    if (!oTag || !obj) {
        return;
    }

    sTagId = util.id(sTagId);

    var sSql = that.sqlWithTable(sObjType, {
        objId: '#{id}',
        objType: sObjType,
        tagId: sTagId,
        isDel: false,
        '#{isPublish}': true,
        '#{isDel}': false
    }, sOrder, nLimit);

    var aResult = $await(that.model.sql(sSql));
    if (!aResult || aResult.length === 0) {
        return [];
    }

    var aIds = aResult.map(function (oItem) {
        return oItem.objId;
    });
    aResult = $await(obj.findById(aIds));

    // 根据 id 排序
    var aTmp = that.mapById(aResult, aIds);
    aResult.length = 0;
    aIds.length = 0;
    return aTmp;
}

function fRelationTagPageObj(sTagId, oCond, sOrder, nPage, nPageCount) {
    var tag = _require('services/tag');

    sTagId = util.id(sTagId);
    var that = this;

    var sObjType;
    if (util.isString(oCond)) {
        sObjType = oCond;
        oCond = null;
    } else {
        sObjType = oCond.objType;
        delete oCond.objType;
    }

    var obj = that.service(sObjType);
    var oTag = $await(tag.findById(sTagId));

    if (!oTag || !obj) {
        return;
    }

    sTagId = util.id(sTagId);
    nPage = parseInt(nPage, 10) || 0;
    nPageCount = parseInt(nPageCount, 10) || nConf.page.site;
    var sSql = that.sqlWithTable(sObjType, _.extend({
        objId: '#{id}',
        objType: sObjType,
        tagId: sTagId,
        isDel: false,
        '#{isPublish}': true,
        '#{isDel}': false
    }, oCond), sOrder, {
        limit: nPageCount,
        offset: nPage * nPageCount
    });

    var aResult = $await(that.model.sql(sSql));
    aResult = aResult || [];
    var aIds = aResult.map(function (oItem) {
        return oItem.objId;
    });

    // 查找对象
    aResult = $await(obj.findById(aIds));
    var aTmp = that.mapById(aResult, aIds);
    aResult.length = 0;
    aIds.length = 0;

    // 获取总数
    sSql = sSql.replace(/select .*? from/i, 'select count(*) as count from');
    aResult = $await(that.model.sql(sSql));
    var nTotalCount = aResult ? aResult[0].count : 0;

    return {
        data: aTmp,
        curPage: nPage,
        perPageCount: nPageCount,
        totalCount: nTotalCount,
        totalPage: util.pageCount(nTotalCount, nPageCount)
    };
}

function fRelationTagMapById(aResult, aIds) {
    var that = this;
    var oTmpMap = {};
    aResult.forEach(function (oItem) {
        oTmpMap[oItem.id] = oItem;
    });
    
    var aTmp = [];
    aIds.forEach(function (sId) {
        oTmpMap[sId] && aTmp.push(oTmpMap[sId]);
    });
    return aTmp;
}