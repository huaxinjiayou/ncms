/* global _require */

var glob = require('glob');
var path = require('path');
var Base = _require('models/base');
var clazz = _require('util/class');
var loader = _require('frame/loader');
var oCache = {};

glob.sync(process.env.PWD + '/sequelize/**/*.js').forEach(function (sFile) {
    var sFileName = path.basename(sFile);
    var sName = sFileName.replace('.js', '');

    if (sName === 'index' || sName === '_relation') {
        return;
    }

    var model = _require('sequelize/' + sName);
    var ModelClass = clazz.create();
    clazz.mix(ModelClass, Base, null, {
        initialize: function (oConf) {
            var that = this;
            ModelClass.superClass.initialize.call(that, oConf);
        }
    });

    oCache[sName] = new ModelClass({
        type: sName,
        sequelize: model
    });
});

// 更改 _require 配置
loader.config('models/', oCache);