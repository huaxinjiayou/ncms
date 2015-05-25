
var common  = _require('controllers/api/sort/common');
var book = _require('services/book');
var util = _require('util/util');

module.exports = {
    post: eval(windAsync(fSortBook))
};

function fSortBook(req, res, next) {
    var that = this;
    var aId = common.split(that.body.id);
    var aSort = common.split(that.body.sort);
    var aParentId = common.split(that.body.parentid);

    // 参数错误
    if (!aId.length || !aSort.length || aId.length !== aSort.length) {
        return that.jsonErr('参数错误');
    }

    // 整理数据
    var aData = [];
    aId.forEach(function (sId, nIndex) {
        aData[nIndex] = {
            id: sId,
            sort: aSort[nIndex],
            parentId: aParentId && aParentId[nIndex]
        };
    });
    aId.length = aSort.length = aParentId.length = 0;

    var oData;
    for (var i = 0, l = aData.length; i < l; i++) {
        oData = aData[i];
        $await(book.updateById(that.user, oData.id, {
            sort: oData.sort,
            parentId: oData.parentId === '-1' ? undefined : util.id(oData.parentId)
        }));
    }

    that.json();
}
