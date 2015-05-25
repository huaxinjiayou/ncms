/* global _require */

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var cache = _require('util/cache');
var sAppRoot = process.env.PWD;

module.exports = fStatic;

// 最多支持的静态目录文件层级
var nLayer = 8;

function fStatic(app, sPath) {
	var sCacheName = 'util/route/static';
	sPath = sPath || 'static/';

	_.times(nLayer, function (nIndex) {
		var sRoute = _.times(nIndex + 1, function (nIndex) {
			return '/:p' + nIndex;
		}).join('');

		app.get(sRoute + '.html', function (req, res, next) {
			if (cache.get(sCacheName, req.url)) {
				res.render(cache.get(sCacheName, req.url));
				return;
			} else if (fs.existsSync(path.join(sAppRoot, 'views', sPath, req.url))) {
				var sFilePath = path.join(sPath, req.url);
				res.render(sFilePath);
				cache.set(sCacheName, req.url, sFilePath);
				return;
			}
			next();
		});
	});
}