/* global _require */
/**
 * 缓存管理，数据不做持久化，重启就没了
 * 作用等同于有数量限制的 RAM
 *
 * 静态用法:
 * cache.set('命名空间', '键', '值');
 *
 * // 默认保存到 sDefaultNameSpace 命名空间中
 * cache.set('键', '值');
 *
 * 实例用法:
 * var oCache = new cache('命名空间', 键的最大数量);
 * oCache.set('键', '值');
 */

var _ = require('underscore');
var clazz = _require('util/class');

var CacheUtil = module.exports = clazz.create();
var sDefaultNameSpace = '360duzheTmp';

_.extend(CacheUtil.prototype, {
    initialize: fInitialize,
    clear: fClear,
    set: fSet,
    get: fGet,
    count: fCount,
    limit: fLimit,
    time: fTime
});

_.extend(CacheUtil, {
    _pool: {},
    clear: fStaticClear,
    set: fStaticSet,
    get: fStaticGet,
    count: fStaticCount,
    limit: fStaticLimit,
    time: fStaticTime
});

function fInitialize(sName, nLimit) {
    var that = this;

    CacheUtil._pool[sName] = that;
    that.name = sName;
    that._limit = nLimit || 100;
    that._cache = {};
    that._cacheKey = [];
}

function fClear(sName) {
    var that = this;

    if (sName !== undefined && that._cache[sName]) {
        // 删除单个
        delete that._cache[sName];

        // 删除索引值
        for (var i = 0, l = that._cacheKey.length; i < l; i++) {
            if (that._cacheKey[i] === sName) {
                that._cacheKey.splice(i, 1);
                break;
            }
        }
    } else if (arguments.length === 0) {
        // 删除全部
        that._cache = {};
        that._cacheKey.length = [];
    }
}

function fGet(sName) {
    var that = this;
    if (that._cache[sName]) {
        that._cache[sName].time++;
        return that._cache[sName].val;
    }
    return;
}

function fSet(sName, sVal) {
    var that = this;

    if (sVal === undefined || sVal === null) {
        return that.clear(sName);
    }

    if (that._cache[sName]) {
        that._cache[sName].val = sVal;
    } else if (that._cacheKey.length < that._limit) {
        that._cache[sName] = {
            name: sName,
            val: sVal,
            time: 0
        };
        that._cacheKey.push(sName);
    } else {
        // 移除部分值
        var nLimit = that._limit;
        that.limit(that._limit - 1);
        that._limit = nLimit;

        // 保存值
        that._cache[sName] = {
            name: sName,
            val: sVal,
            time: 0
        };
        that._cacheKey.push(sName);
    }
}

function fCount() {
    var that = this;
    return that._cacheKey.length;
}

function fLimit(nLimit) {
    var that = this;

    if (arguments.length === 0 || nLimit === undefined || nLimit === null) {
        return that._limit;
    }

    nLimit = nLimit || 100;
    nLimit = Math.max(nLimit, 10);
    that._limit = nLimit;

    if (that._cacheKey.length <= nLimit) {
        return;
    }

    // 移除最少使用的
    var aOldCacheKey = that._cacheKey;
    var aSortKey = [];
    var sKey, oItem, oLastItem;
    for (var i = aOldCacheKey.length - 1; i >= 0; i--) {
        sKey = aOldCacheKey[i];
        oItem = that._cache[sKey];

        if (aSortKey.length < nLimit) {
            aSortKey.push(oItem);
        } else {
            // 排序
            aSortKey.sort(function (a, b) {
                return b.time - a.time;
            });

            // 调整顺序
            oLastItem = aSortKey.pop();
            if (oLastItem.time >= oItem.time) {
                aSortKey.push(oLastItem);
                delete that._cache[oItem.name];
            } else {
                aSortKey.push(oItem);
                delete that._cache[oLastItem.name];
            }
        }
    }
    that._cacheKey.length = 0;
    that._cacheKey = aSortKey.map(function (oItem) { return oItem.name; });
}

function fTime(sName) {
    var that = this;
    if (sName && that._cache[sName]) {
        return that._cache[sName].time || 0;
    }
    return 0;
}

function fStaticClear(sName) {
    CacheUtil[sName] && CacheUtil[sName].clear();
}

function fStaticSet(sName, sKey, sVal) {
    if (arguments.length === 2) {
        sVal = sKey;
        sKey = sName;
        sName = sDefaultNameSpace;
    }

    if (!CacheUtil[sName]) {
        CacheUtil[sName] = new CacheUtil(sName);
    }

    CacheUtil[sName].set(sKey, sVal);
}

function fStaticGet(sName, sKey) {
    if (arguments.length === 1) {
        sKey = sName;
        sName = sDefaultNameSpace;
    }

    return CacheUtil[sName] && CacheUtil[sName].get(sKey);
}

function fStaticCount(sName) {
    if (arguments.length === 0) {
        sName = sDefaultNameSpace;
    }

    return CacheUtil[sName] ? CacheUtil[sName].count() : 0;
}

function fStaticLimit(sName, nLimit) {
    if (arguments.length === 1) {
        nLimit = sName;
        sName = sDefaultNameSpace;
    }

    CacheUtil[sName] && CacheUtil[sName].limit(nLimit);
}

function fStaticTime(sName, sKey) {
    if (arguments.length === 1) {
        sKey = sName;
        sName = sDefaultNameSpace;
    }

    return CacheUtil[sName] ? CacheUtil[sName].time(sKey) : 0;
}