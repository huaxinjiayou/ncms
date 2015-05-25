
var setting = _require('services/setting');

module.exports = {
    filter: ['admin'],
    get: eval(windAsync(fGetSettingIndex))
};

function fGetSettingIndex(req, res, next) {
    var that = this;
    var oFilter = setting.filter();
    oFilter.cond('type', setting.objType.slide);
    oFilter.order('sort asc, createdAt desc');
    var aItems = $await(setting.find(oFilter));
    setting.loadContent(aItems);

    that.render('cpanel/slide/index', {
        items: aItems
    });
}