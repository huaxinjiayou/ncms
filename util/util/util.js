/* global _require */
/* global Task */
/* global Wind */

var _ = require('underscore');

// 避免不必要的循环引用
var redis;

module.exports = {
    // 将 promise 类型转为 Task 对象
    windPromise: fWindPromise,

    // 获取分页数量
    pageCount: fPageCount,
    
    // 获取格式化日期
    date: fDate,
    
    dateDic: fDateDic,
    id: fId,
    map: fMap,

    // 数据操作
    split: fSplit,
    pick: fPick,

    avatar: fAvatar
};

var aType = ['Array', 'Object', 'Function', 'String', 'Number'];
aType.forEach(function (sName) {
    module.exports['is' + sName] = function (obj) {
        return Object.prototype.toString.call(obj) === '[object ' + sName + ']';
    }
});
aType.length = 0;

function fWindPromise(fCb) {
    return function () {
        var that = this;
        var aArg = arguments;
        return Task.create(function (oTask) {
            fCb.apply(that, aArg).then(function (oResult) {
                oTask.complete('success', oResult);
                that = null;
            }, function (oErr) {
                    oTask.complete('failure', oErr);
                    that = null;
                });

            aArg.length = 0;
        });
    }
}

function fPageCount(nTotal, nPageCount) {
    return Math.floor((nTotal - 1) / nPageCount) + 1;
}

function fDate(oDate, sFormation) {
    var that = this;

    if (!oDate) {
        return that.date(new Date());
    }

    if (that.isString(oDate)) {
        oDate = new Date(oDate);
    }

    var nYear = oDate.getFullYear();
    var nMonth = oDate.getMonth() + 1;
    var nDate = oDate.getDate();
    var nHour = oDate.getHours();
    var nMinute = oDate.getMinutes();
    var nSecond = oDate.getSeconds();
    var sWeek = _fGetWeek(oDate);

    sFormation = sFormation || 'yyyy-MM-dd HH:mm'; // 指定默认格式
    return sFormation.replace(/y+|m+|d+|h+|s+|H+|M+|w+/g, _fGetDatePart);

    // 格式替换函数
    function _fGetDatePart(sPart) {
        return {
            yyyy: nYear,
            yy: nYear.toString().slice(-2),
            MM: _fFormNum(nMonth, 2),
            M: nMonth,
            dd: _fFormNum(nDate, 2),
            d: nDate,
            HH: _fFormNum(nHour, 2),
            H: nHour,
            hh: _fFormNum((nHour > 12 ? nHour - 12 : nHour), 2),
            h: nHour > 12 ? nHour - 12 : nHour,
            mm: _fFormNum(nMinute, 2),
            m: nMinute,
            ss: _fFormNum(nSecond, 2),
            s: nSecond,
            w: sWeek
        }[sPart] || sPart;
    }

    function _fFormNum(n) {
        return n == null ? '' : n < 10 ? '0' + n : n + '';
    }

    function _fGetWeek(oDate, nDiff) {
        var aWeek = ['日', '一', '二', '三', '四', '五', '六'];
        var nDay = oDate.getDay();
        if (nDiff) {
            nDay += nDiff % 7 + 7;
            nDay %= 7;
        }
        return aWeek[nDay];
    }
}

function fDateDic(oDate) {
    var that = this;

    if (!oDate) {
        return that.dateDic(new Date());
    }

    var nNow = new Date().getTime();
    var nTime = new Date(oDate).getTime();
    var nSecode = nNow - nTime;

    if (nSecode < 7200000) {
        return '刚刚';
    } else if (nSecode < 86400000) {
        return Math.floor(nSecode / 3600000) + '小时前';
    } else if (nSecode < 2592000000) {
        return Math.floor(nSecode / 86400000) + '天前';
    } else if (nSecode < 31536000000) {
        return Math.floor(nSecode / 2592000000) + '个月前';
    } else {
        var sExt = (nSecode % 31536000000) < 86400000 ? '' : that.dateDic(nSecode % 31536000000);
        return Math.ceil(nSecode / 31536000000) + '年' + sExt;
    }
}

function fSplit(sStr, sSplit) {
    var that = this;
    if (!sStr) {
        return [];
    }

    if (that.isArray(sStr)) {
        return sStr;
    }

    sSplit = sSplit ? sSplit.trim() : ',';
    return sStr.replace(/\s+/g, '').split(sSplit);
}

function fId(obj) {
    var that = this;
    var sId;
    if (arguments.length === 0 || obj === undefined || obj === null) {
        sId = undefined;
    } else if (that.isString(obj) || that.isNumber(obj)) {
        sId = obj + '';
    } else if (that.isObject(obj)) {
        sId = obj.id == undefined ? undefined : obj.id + '';
    }

    // 要保证是数字
    if (sId && /^(-|\+)?\d+$/.test(sId)) {
        sId = (+sId) + '';
    } else {
        // 这里一定要返回 undefined, 条件中带 undefined 的 key 会直接忽略，为 null 则不会
        sId = undefined;
    }

    return sId;
}

function fMap(aItem, fCb) {
    if (!aItem || aItem.length === 0) {
        return {};
    }

    var oResult = {};
    var sItem, sKey;
    for (var i = 0, l = aItem.length; i < l; i++) {
        sItem = aItem[i];
        sKey = fCb ? fCb(sItem) : sItem;
        oResult[sKey] = sItem;
    }
    return oResult;
}

function fPick(oSource, aName, bIgnoreNull) {
    var that = this;

    if (!that.isObject(oSource)) {
        return {};
    }

    var oResult = {};
    aName = that.isArray(aName) ? aName : that.isString(aName) ? that.split(aName) : [];
    var sName;
    for (var i = 0, l = aName.length; i < l; i++) {
        sName = aName[i];
        if (oSource[sName] !== undefined && (oSource[sName] !== null || !bIgnoreNull)) {
            oResult[sName] = oSource[sName];
        }
    }
    return oResult;
}

function fAvatar(oUser) {
    if (!oUser || (!oUser.avatar && !oUser.email)) {
        return nConf.front.staticUrl + '/images/site/navatar.jpg';
    }
    var string = _require('util/string');
    return oUser && oUser.avatar ? oUser.avatar : 'https://cdn.v2ex.com/gravatar/' + string.md5(oUser.email).toLowerCase() + '?d=retro';
}

