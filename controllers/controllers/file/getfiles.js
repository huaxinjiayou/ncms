
var file = _require('services/file');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostFiles))
};

function fPostFiles(req, res, next) {
    var that = this;
    var sType = req.query.type;
    var sId = req.body.id;

    if (sType === 'image') {
        var aResult = $await(file.findByDate(that.user.id, sType, sId));
        aResult = aResult.map(function (oItem) {
            return {
                id: oItem.id,
                bucket: oItem.bucket,
                qnKey: oItem.qnKey,
                size: oItem.size,
                width: oItem.width,
                height: oItem.height
            }
        });
        that.json(aResult);
    } else {
        that.jsonErr('没有指定类别');
    }
}