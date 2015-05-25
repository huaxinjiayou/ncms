
var util = _require('util/util');
var qn = require('qn');

module.exports = {
    // 拼接文件
    getFile : fFileGetFile,
    getImage: fFileGetImage,
    image   : fFileImage,

    // 文件读写
    read    : fFileRead,
    write   : fFileWrite,
    log     : fFileLog,

    // 云端文件操作
    upload  : fFileUpload,
    list    : fFileList
}


function fFileGetFile(sBucket, sKey, bDomain) {
    return bDomain ? sBucket + sKey : 'http://' + sBucket + '.qiniudn.com/' + sKey;
}

/**
 * 获取图片url
 * @param  {String} sBucket 空间名
 * @param  {String} sKey 文件的key
 * @param  {Object} oOption 参数
 *  @param {Number} oOption.mode
 *         1  表示限定目标缩略图的宽度和高度，放大并从缩略图中央处裁剪为指定 <Width>x<Height> 大小的图片。
 *         2  指定 <Width> 和 <Height>，表示限定目标缩略图的长和宽，将缩略图的大小限定在指定的宽高矩形内。
 *         2  指定 <Width> 但不指定 <Height>，表示限定目标缩略图的宽度，高度等比缩略自适应。
 *         2  指定 <Height> 但不指定 <Width>，表示限定目标缩略图的高度，宽度等比缩略自适应。
 *  @param {Number} oOption.width
 *  @param {Number} oOption.height
 *  @param {Number} oOption.quality
 *  @param {String} oOption.format 指定目标缩略图的输出格式，取值范围：jpg, gif, png, webp 等图片格式
 * @return {String}
 */
function fFileGetImage(sBucket, sKey, oOption) {
    var that = this;

    // 调整参数
    if (arguments.length <= 3 && !util.isObject(oOption)) {
        oOption = {
            width: sKey,
            height: oOption
        };
        sKey = sBucket;
        sBucket = 'huaxinjiayou';
    }

    var sUrl = that.getFile(sBucket, sKey) + '?imageView/' + (oOption.mode || 1);
    if (oOption.width) {
        sUrl += '/w/' + oOption.width;
    }
    if (oOption.height) {
        sUrl += '/h/' + oOption.height;
    }
    if (oOption.quality) {
        sUrl += '/q/' + oOption.quality;
    }
    if (oOption.format) {
        sUrl += '/format/' + oOption.format;
    }

    sUrl += '/interlace/1';
    return sUrl;
}

function fFileImage(obj, nWidth, nHeight) {
    var that = this;
    return this.getImage(obj.bucket, obj.qnKey, {width: nWidth, height: nHeight});
}

function fFileRead(sPath) {
    var loader = _require('util/loader');
    var fs = require('fs');
    var sFullPath = loader.path(sPath);
    var sContent = '';

    if (!fs.existsSync(sFullPath)) {
        return sContent;
    }

    try {
        sContent = fs.readFileSync(sFullPath, {encoding: 'utf8'});
    } catch (e) {}
    return sContent;
}

function fFileWrite(sPath, sContent, bAppend) {
    var loader = _require('frame/loader');
    var fs = require('fs');

    var aPath = sPath.split('/');
    var sCurPath = '';
    for (var i = 1, l = aPath.length; i < l; i++) {
        var sCurPath = loader.path(aPath.slice(0, i).join('/'));
        if (!fs.existsSync(sCurPath)) {
            fs.mkdirSync(sCurPath);
        }
    }

    var sFullPath = loader.path(sPath);

    if (!bAppend || !fs.existsSync(sFullPath)) {
        fs.writeFileSync(sFullPath, sContent || '', {encoding: 'utf8'});
    } else {
        fs.appendFileSync(sFullPath, sContent || '', {encoding: 'utf8'});
    }
}

function fFileLog(sContent) {
    var that = this;
    var sWriteContent = util.date(new Date(), 'yyyy-MM-dd hh:mm:ss') + '\n' + sContent + '\n\n';
    that.write('log/' + util.date(new Date(), 'yyyyMMdd') + '.log', sWriteContent, true);
}

/**
 * 上传文件
 * @param   {Object} oData
 * @param   {String} oData.accessKey
 * @param   {String} oData.secretKey
 * @param   {String} oData.bucket
 * @param   {String} oData.domain
 * @param   {String} path
 * @param   {String} fileName
 * @param   {Boolean} isRemote
 */
function fFileUpload(oData) {
    var oClient = qn.create({
        accessKey: oData.accessKey,
        secretKey: oData.secretKey,
        bucket: oData.bucket,
        domain: oData.domain || oData.bucket + '.qiniudn.com'
    });
    var sPath = oData.path;
    var sFileName = oData.fileName;

    if (!(sPath || '').trim()) {
        return;
    }

    if (oData.isRemote || /^https?:\/\//.test(sPath)) {
        var string = _require('util/string');
        return Task.create(function (oTask) {
            var sKey = string.md5(sPath) + '_' + new Date().getTime();
            oClient.fetch(sPath, sKey, function (oErr, oResult) {
                if (oErr) {
                    oTask.complete('failure', oErr);
                    return;
                }
                oResult.key = oResult.key || sKey;
                oTask.complete('success', oResult);
            });
        });
    }

    return Task.create(function (oTask) {
        oClient.uploadFile(sPath, {
            key: sFileName || null
        }, function (oErr, oResult, oHttp) {
            if (oErr) {
                oTask.complete('failure', oErr);
                return;
            }
            oTask.complete('success', oResult);
        });
    });
}

/**
 * 上传文件
 * @param   {Object} oData
 * @param   {String} oData.accessKey
 * @param   {String} oData.secretKey
 * @param   {String} oData.bucket
 * @param   {String} oData.domain
 * @param   {String} oData.option
 *  @param  {String} oData.option.marker // 上一次放回结果中的 marker
 */
function fFileList(oData) {
    var oClient = qn.create({
        accessKey: oData.accessKey,
        secretKey: oData.secretKey,
        bucket: oData.bucket,
        domain: oData.domain || oData.bucket + '.qiniudn.com'
    });

    return Task.create(function (oTask) {
        oClient.list(oData.option || {}, function (oErr, oResult) {
            if (oErr) {
                oTask.complete('failure', oErr);
                return;
            }
            oTask.complete('success', oResult);
        });
    });

}
