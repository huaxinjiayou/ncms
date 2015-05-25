/* global _require */
/**
 * 数据库查询提交对象
 * 1、默认情况下，filter都会加上 isDel: false 这个条件，可以通过指定 isDel : ignore 取消
 * 2、如果没有指定条件（或者只有 isDel 限制），则一律不返回查询条件，可以通过指定属性 noStrict = true 取消检查
 * 3、分页查询中，page 的优先级高于 limit
 */

var _ = require('underscore');
var sequelize = require('sequelize');
var util = _require('util/util');
var pinyin = _require('util/pinyin');
var string = _require('util/string');
var clazz = _require('util/class');

// 创建一个基础类
var Filter = module.exports = clazz.create();

_.extend(Filter.prototype, {
    initialize: fFilterInitialize,

    clear: fFilterClear,
    get: fFilterGet,
    copy: fFilterCopy,

    data: fFilterData,
    cond: fFilterCond,
    attr: fFilterAttr,
    order: fFilterOrder,
    limit: fFilterLimit,
    include: fFilterInclude,
    page: fFilterAddPage,

    addData: fFilterAddData,
    getData: fFilterGetData,
    addCondition: fFilterAddCondition,
    getCondition: fFilterGetCondition,
    addOrder: fFilterAddOrder,
    getOrder: fFilterGetOrder,
    addInclude: fFilterAddInclude,
    hasInclude: fFilterHasInclude,
    getInclude: fFilterGetInclude,
    addAttributes: fFilterAddAttributes,
    getAttributes: fFilterGetAttributes,
    addPage: fFilterAddPage,

    add: fFilterAdd,
    toString: fFilterToString
});

function fFilterInitialize(oConf) {
    var that = this;
    that.type = oConf.type;
    that.sequelize = oConf.sequelize;
    that.clear();
}

function fFilterClear(sName) {
    var that = this;
    switch (sName) {
        case 'data':
            that._data = null;
            break;
        case 'condition':
            that._condition = null;
            break;
        case 'order':
            that._order = null;
            break;
        case 'attributes':
            that._attributes = null;
            break;
        case 'include':
            that._include = null;
            break;
        case 'page':
            that._page = null;
            that._pageCount = nConf.page.site;
            break;
        case 'limit':
            that._limit = 0;
            that._offset = 0;
        default:
            that._data = that._condition = that._order = that._attributes = that._include = that._page = that._limit = that._offset = null;
            that._pageCount = nConf.page.site;
    }

    that.noStrict = false;
    return that;
}

/**
 * 获取查询条件
 * @returns {*}
 */
function fFilterGet() {
    var that = this;
    var oCondition = that.getCondition();
    var bHasLimit = that._limit != undefined && that._offset != undefined;

    // 没有条件 || 只有 isDel, 不允许查询
    // if (!oCondition || _.size(oCondition) === 1 && ('isDel' in oCondition) && !that.includePage && !that.noStrict) {
    //     return null;
    // }
    
    if (!oCondition) {
        return null;
    }

    var oFilter = {
        where: oCondition
    };

    var aOrder = that.getOrder();
    var aInclude = that.getInclude();
    var aAttributes = that.getAttributes();

    if (aOrder) {
        oFilter.order = aOrder;
    }

    if (aInclude) {
        oFilter.include = aInclude;
    }

    if (aAttributes) {
        oFilter.attributes = aAttributes;
    }

    // 包括分页数据
    if (that._page != undefined) {
        var nPage = that._page || 0;
        var nPageCount = that._pageCount;
        oFilter.limit = nPageCount;
        oFilter.offset = nPage * nPageCount;
    } else if (bHasLimit) {
        oFilter.limit = that._limit;
        oFilter.offset = that._offset;
    }

    return oFilter;
}

function fFilterCopy() {
    var that = this;
    var oFilter = new Filter({
        type: that.type,
        sequelize: that.sequelize
    });

    oFilter._data = that._data;
    oFilter._condition = that._condition;
    oFilter._order = that._order;
    oFilter._attributes = that._attributes;
    oFilter._include = that._include;
    oFilter._page = that._page;
    oFilter._limit = that._limit;
    oFilter._offset = that._offset;
    oFilter._pageCount = that._pageCount;
    return oFilter;
}

function fFilterData(sKey, sVal) {
    var that = this;
    if (arguments.length === 0) {
        return that.getData();
    } else if (arguments.length === 1 && util.isString(sKey)) {
        var oData = that.getData();
        return oData[sKey];
    } else {
        return that.addData(sKey, sVal);
    }
}

function fFilterCond(sKey, sVal) {
    var that = this;
    if (arguments.length === 0) {
        return that.getCondition();
    } else if (arguments.length === 1 && util.isString(sKey)) {
        var oCond = that.getCondition();
        return oCond[sKey];
    } else {
        return that.addCondition(sKey, sVal);
    }
}

function fFilterAttr(sKey) {
    var that = this;
    if (arguments.length === 0) {
        return that.getAttributes();
    } else {
        return that.addAttributes(sKey);
    }
}

function fFilterOrder(aOrder) {
    var that = this;
    if (arguments.length === 0) {
        return that.getOrder();
    } else {
        return that.addOrder(aOrder);
    }
}

function fFilterLimit(nLimit, nOffset) {
    var that = this;
    nLimit = util.id(nLimit);
    nOffset = util.id(nOffset);

    if (!nLimit) {
        return;
    }

    that._limit = +nLimit || 0;
    that._offset = +nOffset || 0;
}

function fFilterInclude(oData) {
    var that = this;
    if (arguments.length === 0) {
        return that.getInclude();
    } else {
        return that.addInclude(oData);
    }
}

function fFilterAddData(sKey, sVal) {
    if (sKey === undefined) {
        return;
    }

    var that = this;
    that._data = that._data || that.getData() || {};
    that.add(that._data, sKey, sVal);
    return that;
}

function fFilterGetData() {
    var that = this;
    var oData = that._data;

    if (!oData || !util.isObject(oData)) {
        return null;
    }

    var oRawAttributes = that.sequelize.rawAttributes;

    // 修正拼音
    if ('pinyin' in oRawAttributes && (oData.name || oData.title) && !('pinyin' in oData)) {
        oData.pinyin = null;
    }

    _.each(oData, function (sVal, sKey) {
        var oType = oRawAttributes[sKey];
        if (util.isObject(oType)) {
            oType = oType.type;
        }

        if (sVal === 'null') { // 转化 null
            oData[sKey] = null;
        } else if (sVal === undefined) { // 去掉值为 undefined 的 key
            delete oData[sKey];
        }

        if (!(sKey in oRawAttributes)) {
            delete oData[sKey];
            return;
        }

        if (oType === sequelize.STRING || oType === sequelize.TEXT) { // 字符串
            oData[sKey] = sVal || '';

            // 修正拼音
            if (sKey === 'pinyin' && !sVal) {
                oData.pinyin = pinyin.t(oData.name || oData.title);
            }
        } else if (oType === sequelize.BOOLEAN) { // 布尔值
            oData[sKey] = !!oData[sKey];
        } else if (oType === sequelize.INTEGER) { // 数值
            if (sVal !== null) {
                sVal = parseInt(sVal);
                if (isNaN(sVal) || !util.isNumber(sVal)) {
                    delete oData[sKey];
                } else {
                    oData[sKey] = sVal;
                }
            }
        }
    });

    return _.size(oData) === 0 ? null : oData;
}

function fFilterAddCondition(sKey, sVal) {
    if (sKey === undefined) {
        return;
    }

    var that = this;
    that._condition = that._condition || that.getCondition() || {};
    that.add(that._condition, sKey, sVal);
    return that;
}

function fFilterGetCondition() {
    var that = this;
    var oCondition = util.isObject(that._condition) ? _.clone(that._condition) : {};
    var bNoIsDel = false;
    if (!oCondition || !util.isObject(oCondition)) {
        return null;
    }

    // 去掉值为 undefined 的项
    _.each(oCondition, function (oVal, sKey) {
        if (oVal === undefined) {
            delete oCondition[sKey];
        }
    });

    if (_.size(oCondition).length === 0) {
        return null;
    }

    // 排除掉表中没有的值
    _.each(oCondition, function (_, sKey) {
        if (!that.sequelize.attributes[sKey]) {
            delete oCondition[sKey];
        }
    });

    // // 默认排除已经删除的元素
    // if (that.sequelize.attributes['isDel']) {

    //     // 不强制加isDel
    //     if (oCondition.isDel === 'ignore') {
    //         bNoIsDel = true;
    //         delete oCondition.isDel;
    //     }

    //     // 强制获取没删除的
    //     if (oCondition.isDel !== true && !bNoIsDel) {
    //         oCondition.isDel = false;
    //     }
    // }

    return oCondition;
}

function fFilterAddOrder(aOrder) {
    if (aOrder === undefined) {
        return;
    }

    var that = this;
    aOrder = that.getOrder(aOrder);
    that._order = that._order || that.getOrder() || [];

    if (aOrder.length > 0) {
        that._order = that._order.concat(aOrder);
    }
    return that;
}

function fFilterGetOrder(aOrder) {
    var that = this;
    var aOrder = aOrder || that._order;

    if (!aOrder) {
        return null;
    }

    if (util.isString(aOrder)) {
        var aTmp1 = aOrder.split(','); // 分割逗号
        aOrder = [];
        aTmp1.forEach(function (sVal) {
            var aTmp2 = sVal.trim().split(/\s+/g); // 分割空格
            if (aTmp2.length === 2) {
                aOrder.push(aTmp2);
            }
        });
    }

    return aOrder.length === 0 ? null : aOrder;
}

function fFilterAddInclude(oData) {
    if (oData === undefined) {
        return;
    }

    var that = this;
    var aInclude = that.getInclude(oData);
    that._include = that._include || that.getInclude() || [];
    if (aInclude.length > 0) {
        that._include = that._include.concat(aInclude);
        aInclude.length = 0;
    }
    return that;
}

function fFilterHasInclude(sName) {
    var that = this;
    var aInclude = that.getInclude();
    var bResult = false;

    if (!aInclude || aInclude.length === 0) {
        return bResult;
    }

    sName = sName.toLowerCase();
    aInclude.every(function (oItem) {
        if (oItem.as === sName) {
            bResult = true;
            return false;
        }

        return true;
    });

    return bResult;
}

function fFilterGetInclude(oData) {
    var that = this;
    oData = oData || that._include;

    if (!oData) {
        return null;
    }

    var aInclude = _fGetInclude(oData);
    return aInclude.length === 0 ? null : aInclude;

    // 获取 include 配置
    function _fGetInclude(oData) {
        if (util.isArray(oData)) {
            return oData;
        }

        var aInclude = [];
        _.each(oData, function (oVal, sName) {
            sName = sName.toLowerCase();
            var oInclude = {
                model: _require('sequelize/' + sName),
                as: sName
            };

            var aAttributes = [];
            if (util.isArray(oVal)) {
                oVal.forEach(function (sVal) {
                    if (util.isString(sVal)) {
                        aAttributes.push(sVal);
                    } else if (util.isObject(sVal)) {
                        // 递归调用子 include
                        oInclude.include = _fGetInclude(sVal);
                    }
                });
            } else if (util.isString(oVal)) {
                // aAttributes = oVal.replace(/\s+/, '').split(',');
                aAttributes = util.split(oVal);
            }

            if (aAttributes.length > 0) {
                oInclude.attributes = aAttributes;
            }

            aInclude.push(oInclude);
        });
        return aInclude;
    }
}

function fFilterAddAttributes(sAttr) {
    if (sAttr === undefined) {
        return;
    }

    var that = this;
    var aAttrs = that._attributes || that.getAttributes();

    if (util.isString(sAttr)) {
        // sAttr = sAttr.replace(/\s+/g, '').split(',');
        sAttr = util.split(sAttr);
    }

    if (util.isArray(sAttr)) {
        if (!aAttrs) {
            aAttrs = sAttr;
        } else {
            aAttrs = _.union(aAttrs, sAttr);
        }
    }

    that._attributes = aAttrs;
    return that;
}

function fFilterGetAttributes() {
    var that = this;
    var aAttributes = that._attributes;

    if (util.isString(aAttributes)) {
        // aAttributes = aAttributes.replace(/\s+/g, '').split(',');
        aAttributes = util.split(aAttributes);
    }

    if (!aAttributes || util.isArray(aAttributes) && aAttributes.length === 0) {
        return null;
    } else {
        return _.union(aAttributes, 'id');
    }
}

function fFilterAddPage(nPage, nPageCount) {
    var that = this;
    nPage = util.id(nPage);
    nPageCount = util.id(nPageCount);

    if (nPage !== null || nPage !== undefined) {
        that._page = +nPage ? +nPage : 0;
    }

    if (nPageCount) {
        that._pageCount = +nPageCount;
    }
    return that;
}

function fFilterAdd(oData, sKey, sVal) {
    // 添加函数
    var fAdd = function (oData, sKey, sVal) {
        if (!sKey || sVal === undefined) {
            return;
        }
        oData[sKey] = sVal;
    };

    if (util.isObject(sKey)) { // 对象
        _.each(sKey, function (sTmpVal, sTmpKey) {
            fAdd(oData, sTmpKey, sTmpVal);
        });
    } else if (arguments.length === 3 && util.isString(sKey)) { // 键值对
        fAdd(oData, sKey, sVal);
    }
}

function fFilterToString(bNotAppendKeyPre) {
    var that = this;
    var oData = that.get();

    if (!that.type || !oData) {
        return '';
    }

    var aKeys = _.keys(oData).sort();

    if (aKeys.length === '') {
        return '';
    }

    var oResult = {};

    for (var i = 0, l = aKeys.length; i < l; i++) {
        oResult[aKeys[i]] = oData[aKeys[i]];
    }

    aKeys.length = 0;

    var sKey = string.md5(JSON.stringify(oResult));
    return bNotAppendKeyPre ? sKey : that.type + '_' + sKey;
}
