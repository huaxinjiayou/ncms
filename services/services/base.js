
/**
 * 简单的封装数据库基本操作
 */

var _ = require('underscore');
var Filter = _require('models/filter');
var util = _require('util/util');
var string = _require('util/string');
var clazz = _require('util/class');
var sequelize = require('sequelize');

// 创建一个基础类
var Model = module.exports = clazz.create();

_.extend(Model.prototype, {
    initialize: fInitialize,
    filter: fFilter,
    service: fService,
    hasAttr: fHasAttr,
    sqlWithTable: fSqlWithTable,

    findObjById: eval(windAsync(fFindObjById)),
    existObj: eval(windAsync(fExistObj)),

    create: eval(windAsync(fCreate)),
    update: eval(windAsync(fUpdate)),
    remove: eval(windAsync(fRemove)),
    removeById: eval(windAsync(fRemoveById)),
    find: eval(windAsync(fFind)),
    findOrCreate: eval(windAsync(fFindOrCreate)),
    page: eval(windAsync(fPage)),
    first: eval(windAsync(fFirst)),
    findById: eval(windAsync(fFindById)),
    existById: eval(windAsync(fExistById)),
    count: eval(windAsync(fCount)),
    exist: eval(windAsync(fExist)),
    sql: eval(windAsync(fSql)),

    updateCount: eval(windAsync(fUpdateCount)),
    batchUpdateCount: eval(windAsync(fBatchUpdateCount))
});

function fInitialize(oModel) {
    var that = this;
    this.model = oModel;
    that.type = that.model.type;
    that.sequelize = that.model.sequelize;
}

function fFilter(oFilter) {
    var that = this;
    return new Filter({
        type: that.type,
        sequelize: that.sequelize
    });
}

function fService(sType) {
    var that = this;
    if (!sType) {
        return;
    }
    try {
        return _require('services/' + sType.toLowerCase());
    } catch (e) {}
}

function fHasAttr(sAttr) {
    var that = this;
    return that.model.hasAttr(sAttr);
}

// oCond: {objId: #{id}}
function fSqlWithTable(sTable, oCond, sOrder, oLimit) {
    var that = this;
    var sSql = 'select #{attr} from #{self}, #{table} where #{where} #{order} #{limit}';
    var oRawAttributes = that.sequelize.rawAttributes;

    var aAttr = [];
    var aWhere = [];
    var aOrder = [];

    // 原始值
    _.each(oRawAttributes, function (_, sKey) {
        aAttr.push('#{self}.' + sKey)
    });

    // 条件
    _.each(oCond, function (sVal, sKey) {
        if (/^#\{.*?\}$/.test(sKey)) {
            if (sVal === undefined) {
                return;
            }
            sKey = sKey.replace(/^#\{(.*?)\}$/, function (_, sKey){return sKey;});
            aWhere.push(sVal === null ? ('#{table}.' + sKey + ' is NULL') : ('#{table}.' + sKey + ' = ' + sVal));
            return;
        }

        var bTable = util.isString(sVal) && /^#\{.*?\}$/.test(sVal);
        var oType = oRawAttributes[sKey];
        oType = util.isObject(oType) ? oType.type : oType;
        var bStr = !bTable && (oType === sequelize.STRING || oType === sequelize.TEXT);
        sVal = bTable ? '#{table}.' + sVal.replace(/^#\{(.*?)\}$/, function (_, sKey){return sKey;}) : (bStr ? "'" + sVal + "'" : sVal);
        aWhere.push('#{self}.' + sKey + ' = ' + sVal);
    });

    // 排序
    _.each(Filter.prototype.getOrder(sOrder), function (aVal) {
        aOrder.push('#{self}.' + aVal[0] + ' ' + aVal[1]);
    });

    oLimit = !oLimit ? null : util.isObject(oLimit) ? oLimit : {limit: oLimit};
    sSql = string.execTpl(sSql, {
        attr: aAttr.join(','),
        self: that.sequelize.tableName,
        table: sTable,
        where: aWhere.join(' and '),
        order: aOrder.length > 0 ? 'order by ' + aOrder.join(',') : '',
        limit: oLimit ? 'limit ' + (oLimit.offset || 0) + ',' + oLimit.limit : ''
    });

    return string.execTpl(sSql, {
        self: that.sequelize.tableName,
        table: sTable
    });
}

function fFindObjById(sObjType, sObjId) {
    var that = this;
    var obj = that.service(sObjType);
    if (!obj) {
        return;
    }

    return $await(obj.findById(sObjId));
}

function fExistObj(sObjType, sObjId) {
    var that = this;
    var obj = that.service(sObjType);
    if (!obj) {
        return;
    }

    return $await(obj.exist({
        id: sObjId
    }));
}

function fCreate(oUser, oData) {
    var that = this;
    var oFilter = that.filter();
    oData.userId = util.id(oUser);
    oFilter.data(oData);
    return $await(that.model.create(oFilter));
}

function fUpdate(oFilter) {
    var that = this;
    return $await(that.model.update(oFilter));
}

function fRemove(oCond) {
    var that = this;
    var oFilter = that.filter();
    oFilter.cond(oCond);
    oFilter.data('isDel', true);
    return $await(that.model.update(oFilter));
}

function fRemoveById(sId) {
    var that = this;
    var sId = util.isArray(sId) ? sId : util.id(sId);

    if (!sId || util.isArray(sId) && sId.length === 0) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('id', sId);
    oFilter.data('isDel', true);
    return $await(that.model.update(oFilter));
}

function fFind(oFilter, bAll) {
    var that = this;

    if (oFilter.constructor === Object) {
        var oCond = oFilter;
        oFilter = that.filter();
        oFilter.cond(oCond);
    }

    if (!bAll) {
        oFilter = oFilter.copy();
        oFilter.cond('isDel', false);
    }

    return $await(that.model.find(oFilter));
}

function fFindOrCreate(oUser, oFilter) {
    var that = this;
    oFilter = that.model.fix(oFilter);
    var sUid = util.id(oUser);
    if (sUid) {
        oFilter.cond('userId', sUid);
    }

    var oCond = oFilter.cond();
    if (!oCond) {
        return;
    }

    var oResult = $await(that.first(oFilter));
    if (!oResult) {
        oResult = $await(that.model.create(oFilter));
    }
    return oResult;
}

function fPage(oFilter, bAll) {
    var that = this;
    if (!bAll) {
        oFilter = oFilter.copy();
        oFilter.cond('isDel', false);
    }

    var nPage = oFilter._page || 0;
    var perPageCount = oFilter._pageCount;

    var oResult = $await(Task.whenAll({
        count: that.count(oFilter.cond()),
        data: that.find(oFilter)
    }));

    var oData = {
        data: oResult.data,
        curPage: nPage,
        perPageCount: perPageCount,
        totalCount: oResult.count,
        totalPage: util.pageCount(oResult.count, perPageCount)
    };

    return oData;
}

function fFirst(oFilter, bAll) {
    var that = this;

    if (oFilter.constructor === Object) {
        var oCond = oFilter;
        oFilter = that.filter();
        oFilter.cond(oCond);
    }
    
    if (!bAll) {
        oFilter = oFilter.copy();
        oFilter.cond('isDel', false);
    }

    return $await(that.model.first(oFilter));
}

function fFindById(sId, bAll) {
    if (!sId) {
        return null;
    }

    var that = this;
    var bArray = util.isArray(sId);
    if (bArray && sId.length === 0) {
        return [];
    }

    // if (bArray && sId.length === 1 || bAll) {
    if (!bArray || sId.length === 1) {
        var oResult = $await(that.model.findById(bArray ? sId[0] : sId));
        oResult = bAll || !(oResult || {}).isDel ? oResult : null;
        return bArray ? oResult ? [oResult] : [] : oResult;
    } else {
        var oFilter = that.filter();
        oFilter.cond('id', sId);
        !bAll && oFilter.cond('isDel', false);
        var aResult = $await(that.find(oFilter));
        // if (!bArray) {
        //     return aResult[0];
        // }

        // 重新排序
        var oIdMap = {};
        aResult.forEach(function (oItem) {
            oIdMap[oItem.id] = oItem;
        });
        aResult.length = 0;
        sId.forEach(function (sId) {
            oIdMap[sId] && aResult.push(oIdMap[sId]);
        });
        return aResult;
    }
}

function fExistById(sId, bAll) {
    var that = this;
    sId = util.id(sId);
    if (!sId) {
        return false;
    }

    return $await(that.exist({id: sId}, bAll));
}

function fCount(oCond, bAll) {
    var that = this;

    if (!bAll) {
        oCond.isDel = false;
    }

    var oFilter = that.filter();
    oFilter.cond(oCond);
    return $await(this.model.count(oFilter));
}

function fExist(oCond, bAll) {
    var that = this;

    if (!bAll) {
        oCond.isDel = false;
    }

    var oFilter = that.filter();
    oFilter.cond(oCond);
    oFilter.attr('id');
    var oResult = $await(that.first(oFilter));
    return !!oResult;
}

/**
 * 更新数量
 * @param sId 需要更新的对象id
 * @param sCountKey 数量对应的key
 * @param oSon 子元素 model 对象
 * @param sForeignKey 更新对象在子元素表中对应的外键
 * @returns {*}
 *
 * 比如
 * books hasMany posts，books 表中用 postCount 存储 posts 的数量, posts 中用 bookId 指向 books
 * 更新 id 为 1 的 books 的 posts 数量，直接调用：
 * books.updateCount(1, 'postCount', post, 'bookId');
 */
function fUpdateCount(sId, sCountKey, oSon, sForeignKey) {
    var that = this;
    sId = util.id(sId);

    if (!sId) {
        return;
    }

    var oCond = {};
    if (util.isObject(sForeignKey)) {
        oCond = sForeignKey;
    } else {
        oCond[sForeignKey] = sId;
    }
    oCond.isDel = false;
    var nCount = $await(oSon.count(oCond));

    oFilter = that.filter();
    oFilter.data(sCountKey, nCount);
    oFilter.cond('id', sId);
    $await(that.model.update(oFilter));
}

function fSql() {
    var that = this;
    return that.model.sql.appley(that.model, arguments);
}

/**
 * 批量更新
 * @param aParentId
 * @param sCountKey
 * @param oSon
 * @param sForeignKey
 */
function fBatchUpdateCount(aIds, sCountKey, oSon, sForeignKey) {
    var that = this;
    if (!util.isArray(aIds)) {
        aIds = [aIds];
    }

    var aTask = aIds.map(function (sId) {
        return that.updateCount(sId, sCountKey, oSon, sForeignKey);
    });

    // 执行所有任务
    $await(Task.whenAll(aTask));
}

