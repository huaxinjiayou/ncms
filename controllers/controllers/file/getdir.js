
var file = _require('services/file');

module.exports = {
    filter: ['login'],
    post: eval(windAsync(fPostFileDir))
};

function fPostFileDir(req, res, next) {
    var that = this;
    var oUser = that.user;
    var sType = that.query.type;
    var aItems = $await(file.groupByDate(oUser.id, sType || 'image'));
    aItems = aItems.map(function (oItem) {
        return {
            id: oItem.months,
            name: oItem.months,
            count: oItem.count
        }
    });
    that.json(aItems);
}