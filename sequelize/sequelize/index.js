/* global nConf */
/* global _require */

var Sequelize = require('sequelize');
var path = require('path');
var glob = require('glob');
var loader = _require('frame/loader');
var oConf = nConf.db;
var oModelCache = {};

// 数据库配置
var oSequelize = new Sequelize(oConf.database, oConf.username, oConf.password, {
    host: oConf.host,
    port: oConf.port,
    dialect: oConf.dialect
});

// 载入所有对象
glob.sync(__dirname + '/**/*.js').forEach(function (sFile) {
    var sFileName = path.basename(sFile);
    var sName = sFileName.replace('.js', '');

    if (sName === 'index' || sName === '_relation') {
        return;
    }

    oModelCache[sName] = oSequelize.import(__dirname + '/' + sName);
});

// 更改 _require 配置
loader.config('sequelize/', oModelCache);

// 整理表关系，必须要在更改了 _require 配置之后才能饮用
_require('sequelize/_relation')();

// 定义模块
module.exports = oSequelize;