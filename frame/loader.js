/// <reference path="../../typings/node/node.d.ts"/>

var path = require('path');
var sAppRoot = process.env.PWD;

module.exports = {
	map: {},
	cache: {},
	loader: fLoader,
	config: fConfig,
	path: fPath
};

function fLoader(sName) {
	var oCache = module.exports.cache;
	var oMap = module.exports.map;
	
	// 读取缓存的数据
	if (oCache[sName]) {
		return oCache[sName];
	}
	
	// 分割各个路径的名称
	var aPart = sName.replace(/\s+/g, '').split('/').filter(function (sName) {
		sName = sName.trim();
		return sName !== '' && sName !== '/';
	});
	
	// 读取自定义配置
	var aTmp = aPart.slice(0);
	var sLast = aTmp.pop();
	var sPath = aTmp.join('/');
	if (oMap[sPath] && oMap[sPath][sLast]) {
		return oMap[sPath][sLast];
	}
	
	// 获取绝对路径
	aPart.unshift(sAppRoot);
	sPath = path.join.apply(path, aPart);
	aPart.length = 0;
	oCache[sName] = require(sPath);
    return oCache[sName];
}

function fConfig(sPath, oData) {
	var oMap = module.exports.map;
	sPath = sPath.replace(/\/$/, '');
	oMap[sPath] = oData;
}

function fPath(sName) {
	var aPart = sName.replace(/\s+/g, '').split('/').filter(function (sName) {
		sName = sName.trim();
		return sName !== '' && sName !== '/';
	});

	// 获取绝对路径
    aPart.unshift(sAppRoot);
    var sPath = path.join.apply(path, aPart);
    aPart.length = 0;
    return sPath;
}