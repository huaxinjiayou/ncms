

var Redis       = require('redis');
var _           = require('underscore');
var clazz       = _require('util/class');
var util        = _require('util/util');
var string      = _require('util/string');

var RedisUtil   = clazz.create();
var oRedisConf  = nConf.redis;

_.extend(RedisUtil.prototype, {
    // redis 可用状态
    redisReady  : true,

    initialize  : fRedisUtilInitialize,
    set         : eval(windAsync(fRedisUtilSet)),
    get         : eval(windAsync(fRedisUtilGet)),
    del         : eval(windAsync(fRedisUtilDel))
});

_.extend(RedisUtil, {
    initSyncMethod: fRedisUtilSyncMethod
});

// 返回一个对象
module.exports = new RedisUtil();

function fRedisUtilSyncMethod(oInstance, oClient) {
    var aMethod = ['get', 'set', 'setnx', 'setex', 'append', 'strlen', 'del', 'exists', 'setbit', 'getbit', 'setrange', 'getrange', 'substr',
    'incr', 'decr', 'mget', 'rpush', 'lpush', 'rpushx', 'lpushx', 'linsert', 'rpop', 'lpop', 'brpop', 'brpoplpush', 'blpop', 'llen', 'lindex',
    'lset', 'lrange', 'ltrim', 'lrem', 'rpoplpush', 'sadd', 'srem', 'smove', 'sismember', 'scard', 'spop', 'srandmember', 'sinter', 'sinterstore',
    'sunion', 'sunionstore', 'sdiff', 'sdiffstore', 'smembers', 'zadd', 'zincrby', 'zrem', 'zremrangebyscore', 'zremrangebyrank', 'zunionstore',
    'zinterstore', 'zrange', 'zrangebyscore', 'zrevrangebyscore', 'zcount', 'zrevrange', 'zcard', 'zscore', 'zrank', 'zrevrank', 'hset', 'hsetnx',
    'hget', 'hmset', 'hmget', 'hincrby', 'hdel', 'hlen', 'hkeys', 'hvals', 'hgetall', 'hexists', 'incrby', 'decrby', 'getset', 'mset', 'msetnx',
    'randomkey', 'select', 'move', 'rename', 'renamenx', 'expire', 'expireat', 'keys', 'dbsize', 'auth', 'ping', 'echo', 'save', 'bgsave',
    'bgrewriteaof', 'shutdown', 'lastsave', 'type', 'multi', 'exec', 'discard', 'sync', 'flushdb', 'flushall', 'sort', 'info', 'monitor', 'ttl',
    'persist', 'slaveof', 'debug', 'config', 'subscribe', 'unsubscribe', 'psubscribe', 'punsubscribe', 'publish', 'watch', 'unwatch', 'cluster',
    'restore', 'migrate', 'dump', 'object', 'client', 'eval', 'evalsha'];

    // 不需要继承的方法
    var oUnInheritMethod = {get: 1, set: 1, del: 1, client: 1};

    // 初始化容器
    // 全部转换一遍，再进行缓存
    if (!oInstance.syncMethod) {
        oInstance.syncMethod = {};
    }
    var oSyncMethodMap = oInstance.syncMethod;

    aMethod.forEach(function (sMethod) {
        oSyncMethodMap[sMethod] = Wind.Async.Binding.fromStandard(function () {
            oClient[sMethod].apply(oClient, arguments);
        });

        if (!oUnInheritMethod[sMethod]) {
            oInstance[sMethod] = Wind.Async.Binding.fromStandard(function () {
                oClient[sMethod].apply(oClient, arguments);
            });
        }
    });
}

function fRedisUtilInitialize() {
    var that = this;
    that.client = new Redis.createClient(oRedisConf.port, oRedisConf.host, {});

    // 将 redis 的方法 wind 类型
    RedisUtil.initSyncMethod(that, that.client);

    // password
    if (oRedisConf.password) {
        that.client.auth(oRedisConf.password, function (oErr) {
            if (oErr) {
                throw oErr;
            }
        });
    }

    // db
    that.client.select(oRedisConf.cache);
    that.client.on('connect', function () {
        that.client.send_anyways = true;
        that.client.select(oRedisConf.cache);
        that.client.send_anyways = false;
    });

    that.client.on('error', function () {
        that.redisReady = false;
    });

    that.client.on('connect', function () {
        that.redisReady = true;
    });
}

function fRedisUtilSet(sKey, sVal, nDuration) {
    var that = this;

    // 不可用
    if (!that.redisReady) {
        return;
    }

    // 先序列化，再保存
    var sSaveStr = string.obj2str(sVal);

    if (!nDuration) {
        $await(that.syncMethod.set(sKey, sSaveStr));
    } else {
        nDuration = Math.max(1, nDuration / 1000);
        $await(that.syncMethod.setex(sKey, nDuration, sSaveStr));
    }
    return true;
}

function fRedisUtilGet(sKey) {
    var that = this;

    // 不可用
    if (!that.redisReady) {
        return;
    }

    var sSaveStr = $await(that.syncMethod.get(sKey));

    if (!sSaveStr) {
        return null;
    }

    return string.str2obj(sSaveStr);
}

function fRedisUtilDel(sKey, bBlur) {
    if (util.isArray(sKey)) {
        sKey = sKey.join(',');
    } else if (!util.isString(sKey)) {
        return;
    }

    var that = this;
    var aKeys = util.split(sKey);

    if (aKeys.length === 0) {
        return;
    }

    // 去重
    aKeys = _.uniq(aKeys);

    if (!bBlur) {
        // 非模糊匹配
        for (var i = 0, l = aKeys.length; i < l; i++) {
            $await(that.syncMethod.del(aKeys[i]));
        }
    } else {
        var aDelKeys = [];
        var aTmpKeys;
        for (var i = 0, l = aKeys.length; i < l; i++) {
            aTmpKeys = $await(that.syncMethod.keys(aKeys[i]));
            if (aTmpKeys.length > 0) {
                aDelKeys = aDelKeys.concat(aTmpKeys);
            }
        }

        if (aDelKeys.length === 0) {
            return;
        }

        aDelKeys = _.uniq(aDelKeys);

        // 递归调用吧
        return $await(that.del(aDelKeys.join(',')));
    }
}

