
var _ = require('underscore');
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/relationpost');

clazz.mix(Service, Base, {

}, {
    initialize: fRelationPostInitialize,

    addPost: eval(windAsync(fRelationPostAddPost)),
    delPost: eval(windAsync(fRelationPostDelPost)),
    findRelations: eval(windAsync(fRelationPostFindRelations)),
    pageRelations: eval(windAsync(fRelationPostPageRelations)),
    removeById: eval(windAsync(fRelationPostRemoveById)),

    findCount: eval(windAsync(fRelationPostFindCount))
});
module.exports = new Service(oModel);

function fRelationPostInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fRelationPostAddPost(oUser, sObjType, sObjId, sPid) {
    var that = this;
    var sUid = util.id(oUser);
    var oFilter;

    sPid = util.id(sPid);
    sObjId = util.id(sObjId);

    if (!sUid || !sObjType || !sObjId || !sPid) {
        return;
    }

    var oService = that.service(sObjType);
    var oItem = $await(that.findObjById(sObjType, sObjId));
    if (!oService || !oItem) {
        return;
    }

    if (oService.hasAttr('userId') && util.id(oItem.userId) !== sUid) {
        return;
    }

    var oRelation = $await(that.first({
        objType: sObjType,
        objId: sObjId,
        postId: sPid
    }, true));

    if (!oRelation) {
        $await(that.create(oUser, {
            objType: sObjType,
            objId: sObjId,
            postId: sPid
        }));
    } else if (oRelation.isDel) {
        oFilter = that.filter();
        oFilter.data('isDel', false);
        oFilter.cond('id', oRelation.id);
        $await(that.update(oFilter));
    } else {
        return;
    }

    // 修改数量
    if (oService.hasAttr('itemCount')) {
        var nCount = $await(that.findCount(sObjType, sObjId));
        oFilter = oService.filter();
        oFilter.cond('id', oItem.id);
        oFilter.data('itemCount', nCount);
        $await(oService.update(oFilter));
    }
}

function fRelationPostDelPost(oUser, sObjType, sObjId, oPost) {
    var that = this;
    var sUid = util.id(oUser);
    var sPid = util.id(oPost);
    var oFilter;

    sObjId = util.id(sObjId);

    if (!sUid || !sObjType || !sObjId || !sPid) {
        return;
    }

    var oService = that.service(sObjType);
    var oItem = $await(that.findObjById(sObjType, sObjId));
    if (!oService || !oItem) {
        return;
    }

    if (oService.hasAttr('userId') && util.id(oItem.userId) !== sUid) {
        return;
    }

    var oRelation = $await(that.first({
        objType: sObjType,
        objId: sObjId,
        postId: sPid
    }, true));

    if (oRelation && !oRelation.isDel) {
        oFilter = that.filter();
        oFilter.data('isDel', true);
        oFilter.cond('id', oRelation.id);
        $await(that.update(oFilter));
    } else {
        return;
    }

    // 修改数量
    if (oService.hasAttr('itemCount')) {
        var nCount = $await(that.findCount(sObjType, sObjId));
        oFilter = oService.filter();
        oFilter.cond('id', oItem.id);
        oFilter.data('itemCount', nCount);
        $await(oService.update(oFilter));
    }
}

function fRelationPostFindRelations(sObjType, sObjId, nLimit, sOrder) {
    var that = this;
    var obj = that.service(sObjType);
    if (!obj) {
        return;
    }

    var sSql = that.sqlWithTable('post', {
        postId: '#{id}',
        objType: sObjType,
        objId: sObjId,
        isDel: false,
        '#{isPublish}': true,
        '#{isDel}': false
    }, sOrder, nLimit);
    var aResult = $await(that.model.sql(sSql));
    return aResult || [];
}

function fRelationPostPageRelations(sObjType, sObjId, sOrder, nPage, nPageCount) {
    var that = this;
    var obj = that.service(sObjType);
    if (!obj) {
        return;
    }

    nPage = parseInt(nPage, 10) || 0;
    nPageCount = parseInt(nPageCount, 10) || nConf.page.site;
    var sSql = that.sqlWithTable('post', {
        postId: '#{id}',
        objType: sObjType,
        objId: sObjId,
        isDel: false,
        '#{isPublish}': true,
        '#{isDel}': false
    }, sOrder, {
        limit: nPageCount,
        offset: nPage * nPageCount
    });
    var aResult = $await(that.model.sql(sSql));

    // 获取总数
    sSql = sSql.replace(/select .*? from/i, 'select count(*) as count from');
    var aTmp = $await(that.model.sql(sSql));
    var nTotalCount = aTmp ? aTmp[0].count : 0;

    return {
        data: aResult || [],
        curPage: nPage,
        perPageCount: nPageCount,
        totalCount: nTotalCount,
        totalPage: util.pageCount(nTotalCount, nPageCount)
    };
}

function fRelationPostRemoveById(oUser, sId) {
    var that = this;
    var oItem = $await(that.findById(sId));
    if (!oItem) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('id', sId);
    oFilter.data('isDel', true);
    $await(that.update(oFilter));

    var obj = that.service(oItem.objType);
    if (!obj) {
        return;
    }

    var nCount = $await(that.findCount(oItem.objType, oItem.objId));
    var oFilter = obj.filter();
    oFilter.cond('id', oItem.objId);
    oFilter.data('itemCount', nCount);
    $await(obj.update(oFilter));
}

function fRelationPostFindCount(sObjType, sObjId) {
    var that = this;
    var sSql = that.sqlWithTable('post', {
        postId: '#{id}',
        objType: sObjType,
        objId: sObjId,
        isDel: false,
        '#{isPublish}': true,
        '#{isDel}': false
    });

    sSql = sSql.replace(/select .*? from/i, 'select count(*) as count from');
    aResult = $await(that.model.sql(sSql));
    return aResult ? aResult[0].count : 0;
}
