/* global _require */

var crypto      = require('crypto');
var util        = _require('util/util');

module.exports = {
    len             : fLen,
    left            : fLeft,

    // 英文标点转为中文标点
    zhSymbol        : fZhSymbol,
    execTpl         : fExecTpl,

    // 字符串判断
    clearHtml       : fClearHtml,
    isEmail         : fIsEmail,

    // 序列化和反序列化
    obj2str         : fObj2Str,
    str2obj         : fStr2Obj,

    // 增加参数
    addParam        : fAddParam,
    removeParam     : fRemoveParam,
    getParam        : fGetparam,
    getParams       : fGetparams,

    md5             : fMd5, // md5加密字符串
    encrypt         : fStringEncrypt, // AES加密
    decrypt         : fStringDecrypt, // AES解密
    random          : fRandom // 生成随机字符串
};

function fLen(sStr, bChineseFor1) {
    var l = 0;
    for (var i = 0, m = sStr.length; i < m; i++) {
        l += sStr.charCodeAt(i) > 255 && !bChineseFor1 ? 2 : 1;
    }
    return l;
}

function fLeft(sStr, nLength, nEllipsisLen) {
    var that = this;
    nLength = nLength * 2;

    if (!sStr) {
        return '';
    }
    
    if (!nLength && nLength !== 0 || that.len(sStr) <= nLength) {
        return sStr;
    }
    
    // true则为2，非大于0的变量为0
    nEllipsisLen = nEllipsisLen === false ? 0 : +nEllipsisLen || 3;

    var i = 0;
    var j = 0;
    nLength = nLength - nEllipsisLen;
    while (j < nLength) {
        j += sStr.charCodeAt(i) > 255 ? 2 : 1;
        i++;
    }
    sStr = sStr.substring(0, i) + (new Array(nEllipsisLen + 1)).join('.');
    return sStr;
}

function fZhSymbol(str) {
    var oMap = {',': '，', '?': '？', ':': '：', '!': '！'};
    return str.replace(/(\,|\?|\:)/gi, function (sFull, sKey) {
        return oMap[sKey] || sKey;
    });
}



function fExecTpl(sTpl, oData) {
    if (!sTpl || !util.isObject(oData)) {
        return '';
    }
    return sTpl.replace(/#{(.*?)}/g, function (sStr, sName) {
        return oData[sName] == undefined ? '' : oData[sName];
    });
}

function fClearHtml(sHtml) {
    sHtml = sHtml || '';
    if (!sHtml) {
        return sHtml;
    }
    
    sHtml = sHtml.replace(/<.*?>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    return sHtml;
}

function fIsEmail(sEmail) {
    return sEmail && util.isString(sEmail) && /^([a-zA-Z0-9_\.\-])+\@([a-zA-Z0-9\-])+\.([a-zA-Z]{2,4})$/.test(sEmail.trim());
}

function fObj2Str(oVal) {
    return JSON.stringify({data: oVal});
}

function fStr2Obj(sVal) {
    var oData = {};
    try {
        oData = JSON.parse(sVal);
    } catch (e) {}

    return oData.data;
}

function fAddParam(sHref, oParams, bNotCover) {
    if (!sHref) {
        return '';
    }

    sHref = sHref.trim();

    var that = this;
    var aUrl = sHref.split('#'); // 将hash提取出来
    var sUrl = aUrl[0];
    var sChar = sUrl.indexOf('?') > -1 ? '&' : '?';
    var sVal;

    if (util.isString(oParams)) {
        var sFirstChar = oParams.charAt(0);
        oParams = sFirstChar === '?' || sFirstChar === '&' ? oParams.slice(1) : oParams;
        sUrl += sChar + oParams;
    } else {
        for (var sKey in oParams) {
            sVal = oParams[sKey];
            if (!sVal && sVal !== 0) {
                continue;
            }

            if (sUrl.indexOf('?' + sKey) === -1 && sUrl.indexOf('&' + sKey) === -1) {
                sUrl += sChar + sKey + '=' + encodeURIComponent(oParams[sKey]);
                sChar = '&';
            } else if (!bNotCover) {
                sUrl = sUrl.replace(new RegExp(sKey + '=' + '[^&#]*'), sKey + '=' + encodeURIComponent(oParams[sKey]));
            }
        }
    }

    aUrl[0] = sUrl;
    return aUrl.join('#');
}

function fRemoveParam(sHref, sParam) {
    var that = this;
    if (!sHref) {
        return '';
    }

    if (!sParam) {
        return sHref;
    }

    var oParam = that.getParams(sHref);
    delete oParam[sParam];

    // 将hash提取出来
    var aUrl = sHref.split('#');
    var sUrl = aUrl[0];
    aUrl[0] = sUrl.split('?')[0];
    return that.addParam(aUrl.join('#'), oParam);
}

function fGetparam(sHref, sParam) {
    if (!sHref || !sParam) {
        return '';
    }

    var that = this;
    var oParam = that.getParams(sHref);
    return oParam[sParam] ? decodeURIComponent(oParam[sParam]) : '';
}

function fGetparams(sHref) {
    if (!sHref) {
        return {};
    }

    var that = this;
    var sName = sHref.replace(/(#.+)/g, ''); // 去掉hash

    // 标准化url
    var sQuery = sName.split('?')[1];
    var aParameter = sQuery ? sQuery.split('&') : [];
    var oCache = {};
    var aPair;

    if (aParameter.length > 0) {
        for (var i = 0, l = aParameter.length; i < l; i++) {
            aPair = /([^=]+)=([^=]*)/.exec(aParameter[i]);
            if (aPair) {
                oCache[aPair[1]] = aPair[2];   
            }
        }
    }
    return oCache;
}

function fMd5(str) {
    str = str + '';
    return crypto.createHash('md5').update(str).digest('hex');
}

function fStringEncrypt(str, sKey) {
    var oCipher = crypto.createCipher('aes192', sKey);
    var sEnc = oCipher.update(str, 'utf8', 'hex');
    sEnc += oCipher.final('hex');
    return sEnc;
}

function fStringDecrypt(str, sKey) {
    var oDecipher = crypto.createDecipher('aes192', sKey);
    var sDec = oDecipher.update(str, 'hex', 'utf8');
    sDec += oDecipher.final('utf8');
    return sDec;
}

function fRandom(nLength) {
    nLength = nLength || 16;
    var sChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-+=<>?{}[]';
    var sResult = '';
    var nCharCount = sChar.length;
    var i = 0;
    while(i++ < nLength) {
        sResult += sChar.charAt(Math.floor(Math.random() * nCharCount));
    }

    return sResult;
}