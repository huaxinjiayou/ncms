
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var oModel = _require('models/note');

var Service = clazz.create();

clazz.mix(Service, Base, {

}, {
    initialize: fNoteInitialize,
    removeById: eval(windAsync(fNoteRemoveById))
});
module.exports = new Service(oModel);

function fNoteInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fNoteRemoveById(oUser, sNid) {
    var that = this;
    var sUid = util.id(oUser);
    var oNote = $await(that.findById(sNid));
    var oFilter = null;

    if (!sUid || util.id(oNote.userId) !== sUid || !sNid) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('id', sNid);
    oFilter.data('isDel', true);
    oFilter.data('itemCount', 0);
    $await(that.update(oFilter));

    var relationpost = _require('services/relationpost');
    var oFilter = relationpost.filter();
    oFilter.cond('objType', that.type);
    oFilter.cond('objId', sNid);
    oFilter.data('isDel', true);
    $await(relationpost.update(oFilter));
}