
var tag = _require('services/tag');
var relationtag = _require('services/relationtag');

module.exports = {
    filter: ['admin'],
    post: eval(windAsync(fPostActionRecommend))
}

function fPostActionRecommend(req, res, next) {
    var that = this;
    var sObjType = that.body.type;
    var sObjId = that.body.id;

    var obj = tag.service(sObjType);
    var oItem = $await(obj.findObjById(sObjType, sObjId));
    if (!obj || !oItem) {
        that.render500('错误的参数');
        return;
    }

    var oRecommend = $await(tag.recommend());
    $await(relationtag.addTag(sObjType, sObjId, oRecommend));
    that.json();
}