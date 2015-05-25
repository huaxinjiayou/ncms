
var common  = _require('controllers/api/sort/common');
var post = _require('services/post');
var util = _require('util/util');

module.exports = {
    post: eval(windAsync(fSortPost))
};

function fSortPost(req, res, next) {
    var that = this;
    var oUser = that.user;
    var aId = common.split(that.body.id);
    var aSort = common.split(that.body.sort);

    // 参数错误
    if (!aId.length || !aSort.length || aId.length !== aSort.length) {
        return that.jsonErr('参数错误');
    }

    // 整理数据
    var aData = [];
    aId.forEach(function (sId, nIndex) {
        aData[nIndex] = {
            id: sId,
            sort: aSort[nIndex]
        };
    });
    aId.length = aSort.length = 0;

    var oData, oFilter;
    for (var i = 0, l = aData.length; i < l; i++) {
        oData = aData[i];
        $await(post.updateById(that.user, oData.id, {
            sort: oData.sort
        }));
    }

    that.json();
}
