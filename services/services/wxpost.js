
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/wxpost');

clazz.mix(Service, Base, null, {
    initialize: fWxPostInitialize
});
module.exports = new Service(oModel);

function fWxPostInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}