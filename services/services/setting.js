
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var string = _require('util/string');
var Service = clazz.create();
var oModel = _require('models/setting');

clazz.mix(Service, Base, {

}, {
    objType: {
        slide: 'slide'
    },
    initialize: fSettingInitialize,
    loadContent: fSettingLoadContent
});
module.exports = new Service(oModel);

function fSettingInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fSettingLoadContent(aItems) {
    if (!util.isArray(aItems)) {
        aItems = [aItems];
    }
    
    (aItems || []).forEach(function (oItem) {
        oItem.content = string.str2obj(oItem.content);
    });
}