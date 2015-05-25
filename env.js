/* global Wind */

var loader = require('./frame/loader');
var _require = loader.loader;
var config = _require('config');

// 自定义加载器
global._require = _require;

// 全局的配置文件
global.nConf = config;

// 异步加载
global.Wind = require('wind');
global.Task = Wind.Async.Task;

// 全局的异步加载
global.windAsync = function (fCb) {
    return Wind.compile('async', fCb);
};

_require('sequelize');
_require('models');