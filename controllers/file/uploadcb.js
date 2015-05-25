
var file = _require('services/file');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostFileUpCb))
};

function fPostFileUpCb(req, res, next) {
    var that = this;
    var sBucket = that.body.bucket;
    var sKey = that.body.key;

    if (!sBucket || !sKey) {
        return that.jsonErr('缺少数据');
    }

    var sName = that.body.name || '';
    var sSize = that.body.size || '';
    var sMimeType = that.body.type || '';
    var sSuffix = sName.split('.').pop();

    var aMimeTypes = sMimeType.split('/');
    var sFileType = aMimeTypes[0] || '';
    var sFileFormat = aMimeTypes[1] || '';

    var nWidth = 0;
    var nHeight = 0;

    if (sFileType === 'image') {
        var oImageInfo = that.body.imageInfo || {};
        nWidth = oImageInfo.width || 0;
        nHeight = oImageInfo.height || 0;
        sFileFormat = oImageInfo.format || '';
    }

    var oFile = $await(file.create(that.user, {
        bucket: sBucket,
        qnKey: sKey,
        name: sName,
        size: sSize,
        mimeType: sMimeType,
        suffix: sSuffix,
        format: sFileFormat,
        type: sFileType,
        width: nWidth,
        height: nHeight
    }));

    that.json({
        id: oFile.id,
        bucket: sBucket,
        key: sKey,
        width: nWidth,
        height: nHeight,
        size: sSize
    });
}