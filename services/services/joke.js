
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var string = _require('util/string');
var Service = clazz.create();
var oModel = _require('models/joke');
var redis = _require('util/redis');

clazz.mix(Service, Base, {

}, {
    initialize: fJokeInitialize,
    create: eval(windAsync(fJokeCreate)),
    randomId: eval(windAsync(fJokeRandomId)),
    random: eval(windAsync(fJokeRandom))
});
module.exports = new Service(oModel);

function fJokeInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}
function fJokeCreate(oUser, oData) {
    var that = this;
    var sRawContent = string.clearHtml(oData.content);
    oData.words = sRawContent.replace(/[\s\r\t\n]/gi, '').length;
    return $await(Service.superClass.create.call(that, oUser, oData));
}

function fJokeRandomId() {
    var that = this;
    var aResult = $await(that.model.sql('select floor(rand() * count(*)) as `offset` from `joke` where isDel = 0 and isPublish = 1 and hasImg = 0 and words < 120 limit 0, 1;'));
    var nOffset = aResult ? aResult[0].offset : 0;
    aResult = $await(that.model.sql('select id from `joke` where isDel = 0 and isPublish = 1 and hasImg = 0 and words < 120 limit #{offset}, 1;', {offset: nOffset}));
    return aResult && aResult.length > 0 ? aResult[0].id : null;
}

function fJokeRandom() {
    var that = this;
    var sJokeId = $await(that.randomId());
    if (!sJokeId) {
        return;
    }

    var sKey = 'joke_' + sJokeId;
    var oCache = $await(redis.get(sKey));

    if (!oCache) {
        oCache = $await(that.findById(sJokeId));
        if (oCache) {
            $await(redis.set(sKey, oCache, 604800000));
        }
    }
    
    return oCache;
}
