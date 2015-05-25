
var util = _require('util/util');

module.exports = {
    ignore: true,
    split: fApiSplit
};

// 处理数据
function fApiSplit(aData) {
    if (!aData) {
        return [];
    } else if (util.isString(aData)) {
        return aData.split(',').filter(function (sItem) {return sItem.trim() !== '';});
    } else if (util.isArray(aData)) {
        return aData.filter(function (sItem) {return sItem.trim() !== '';})
    }
    return aData;
}