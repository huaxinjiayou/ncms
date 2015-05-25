
// 载入 app 环境变量
require('../env');
var redis = _require('util/redis');

// wrap 不能封装到类库中，不然会丢失上下文
function wrap(fCb) {
    return function (done) {
        eval(windAsync(fCb))(done).start();
    };
}

describe('services/action', function () {

    it('set/get', wrap(function (done) {
        $await(redis.set('huaxinjiayou', '1', 1000));
        var sResult = $await(redis.get('huaxinjiayou'));
        sResult.should.eql('1');

        $await(Wind.Async.sleep(800));
        sResult = $await(redis.get('huaxinjiayou'));
        sResult.should.eql('1');

        $await(Wind.Async.sleep(200));
        sResult = $await(redis.get('huaxinjiayou'));
        (!sResult).should.be.true;

        done();
    }));
    
    
});




