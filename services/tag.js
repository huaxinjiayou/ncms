
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/tag');

clazz.mix(Service, Base, {
    type: {
        recommend: 200
    }
}, {
    initialize: fTagInitialize,
    recommend: eval(windAsync(fTagRecommend))
});
module.exports = new Service(oModel);

function fTagInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fTagRecommend() {
    var that = this;
    var oTag = $await(that.first({type: Service.type.recommend}));

    if (!oTag) {
        oTag = $await(that.create(null, {
            title: '推荐',
            type: Service.type.recommend,
            isEnd: true
        }))
    } else if (oTag.isDel) {
        var oFilter = that.filter();
        oFilter.data('isDel', false);
        oFilter.cond('id', oTag.id);
        oTag.isDel = false;
        $await(that.update(oFilter));
    }

    return oTag;
}