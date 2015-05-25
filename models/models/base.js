/* global windAsync */
/* global $await */
/* global _require */
/**
 * 简单的封装数据库基本操作
 */

var _ = require('underscore');
var sequelize = require('sequelize');
var Filter = _require('models/filter');
var sequelizeWind = _require('models/wind');
var util = _require('util/util');
var string = _require('util/string');
var clazz = _require('util/class');
var redis = _require('util/redis');

// 创建一个基础类
var Model = module.exports = clazz.create();

_.extend(Model.prototype, {
    initialize: fInitialize,
    fix: fFix,
    hasAttr: fHasAttr,

    create: eval(windAsync(fCreate)),
    update: eval(windAsync(fUpdate)),
    find: eval(windAsync(fFind)),
    findById: eval(windAsync(fFindById)),
    first: eval(windAsync(fFirst)),
    count: eval(windAsync(fCount)),
    destroy: eval(windAsync(fDestroy)),
    sql: eval(windAsync(fSql)),
    rebuild: eval(windAsync(fRebuild)),

    json: fJson
});

function fInitialize(oConf) {
    var that = this;
    that.type = oConf.type;
    that.sequelize = oConf.sequelize;
}

function fFix(oFilter) {
    var that = this;
    if (!oFilter) {
        return;
    }

    if (oFilter.type !== that.type) {
        oFilter.type = that.type;
    }

    if (oFilter.sequelize !== that.sequelize) {
        oFilter.sequelize = that.sequelize;
    }
    return oFilter;
}

function fHasAttr(sAttr) {
    var that = this;
    var oRawAttributes = that.sequelize.rawAttributes;
    return sAttr && sAttr in oRawAttributes;
}

function fCreate(oFilter) {
    var that = this;
    that.fix(oFilter);
    var oData = oFilter.data();

    if (!oData) {
        return;
    }

    // 禁止设置删除
    delete oData.isDel;

    oData = $await(sequelizeWind.create.call(that.sequelize, oData));
    oData = that.json(oData);
    return oData;
}

function fUpdate(oFilter) {
    var that = this;
    if (!oFilter) {
        return;
    }

    that.fix(oFilter);
    var oCond = oFilter.cond();
    var oData = oFilter.data();

    if (!oData || !oCond || _.size(oData) === 0) {
        return;
    }

    if (util.isArray(oCond.id) && oCond.id.length === 1) {
        oCond.id = oCond.id[0];
    }

    $await(sequelizeWind.update.call(that.sequelize, oData, { where: oCond }));
}

function fFind(oFilter) {
    var that = this;
    that.fix(oFilter);

    if (!oFilter || !oFilter.get()) {
        return;
    }

    var oData = $await(sequelizeWind.findAll.call(that.sequelize, oFilter.get()));
    return that.json(oData);
}

function fFindById(sId) {
    var that = this;
    sId = util.id(sId);
    if (!sId) {
        return;
    }

    // 用 redis 做下缓存，避免可能的频繁查询
    var sKey = that.type + '_' + sId;
    var oRedis = $await(redis.get(sKey));

    var oData = $await(sequelizeWind.find.call(that.sequelize, sId));
    oData = that.json(oData);

    if (oData) {
        $await(redis.set(sKey, oData, 250));
    }

    return oData;
}

function fFirst(oFilter) {
    var that = this;
    that.fix(oFilter);

    var oData = $await(sequelizeWind.find.call(that.sequelize, oFilter.get()));
    oData = that.json(oData);
    return oData;
}

function fCount(oFilter) {
    var that = this;
    if (!oFilter) {
        return 0;
    }

    that.fix(oFilter);
    var oCond = oFilter.cond();
    if (!oCond) {
        return 0;
    }

    var nCount = $await(sequelizeWind.count.call(that.sequelize, { where: oCond }));
    return nCount;
}

function fDestroy(oFilter) {
    var that = this;
    if (!oFilter) {
        return;
    }

    that.fix(oFilter);
    var oCond = oFilter.cond();
    if (!oCond) {
        return;
    }

    $await(sequelizeWind.destroy.call(that.sequelize, oCond));
    return true;
}

function fSql(sql, oData) {
    var that = this;
    oData = oData || {};

    var that = this;
    var sequelize = _require('sequelize');
    var aArg = [string.execTpl(sql, oData)];

    if (oData.extConf) {
        aArg.push(oData.sequelize);
        aArg.push(oData.extConf);
    }

    var aResult = $await(sequelizeWind.query.apply(sequelize, aArg));
    return aResult && aResult.length > 0 ? aResult : null;
}

function fRebuild(bForce) {
    var that = this;
    bForce = !!bForce;
    $await(sequelizeWind.sync.call(that.sequelize, { force: bForce }));
    return true;
}

function fJson(oData) {
    if (util.isObject(oData)) {
        oData = oData.toJSON ? oData.toJSON() : oData;
    } else if (util.isArray(oData)) {
        oData.forEach(function (oResult, nIndex) {
            oData[nIndex] = oResult.toJSON ? oResult.toJSON() : oResult;
        });
    }
    return oData;
}