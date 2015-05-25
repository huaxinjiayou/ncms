/* global $await */
/* global _require */

/**
 * 路由配置
 *
 * 说明：
 *     1、ignore： true 不解析这个文件，可以利用这个文件为整个路由组提供特定的公用方法
 *     2、所有的 index 会被自动忽略
 *     3、如果文件中配置了 route，则会优先使用指定的 route ，忽略当前文件名
 * 
 * 标准模板：
 *
 * module.exports = {
 *      ignore: Boolean, // true不解析这个文件
 *      route: String, // 路径名称，一般只是改个后缀什么的
 *      get: { // 请求方式
 *          route: String, // 路径名称，一般只是改个后缀什么的
 *          filter: Array, // 过滤器
 *          action: Function , // 该路由下的回调
 *      }
 * }
 *
 * 简写1：
 * module.exports = {
 *     get: Function, // 该路由下 GET 的回调
 *     post: Function, // 该路由下 POST 的回调
 * }
 *
 * 简写2：
 * module.exports = Function // 该路由下 GET 方式的回调
 */

var glob = require('glob');
var fs = require('fs');
var path = require('path');
var util = _require('util/util');
var Handler = _require('frame/handler');
var clazz = _require('util/class');
var sAppRoot = process.env.PWD;

module.exports = fNav;

function fNav(app, sCtrDir, sFltDir) {
    sCtrDir = path.join(sAppRoot, sCtrDir || 'controllers');
    sFltDir = path.join(sAppRoot, sFltDir || 'filters');
    var aRoutes = [];
    var oRouteParam = {};
    
    glob.sync(sCtrDir + '/**/*.+(js|coffee)').forEach(function (sFile) {
        var oConf = fParser(sFile, sCtrDir, sFltDir);
        if (!oConf) {
            return;
        }
        
        // 创建每个 controller 的类
        var RouterHandler = clazz.create();
        clazz.mix(RouterHandler, Handler, null, oConf);

        ['get', 'post'].forEach(function (sMethod) {
            if (!oConf[sMethod]) {
                return;
            }
            
            // 将 action 和 filter 在最外层包装成 task
            // 1、便于统一接管处理所有的程序错误，不用重复写 try ... catch ...
            // 2、避免每次请求都重新 eval 一次
            var fActionTask = eval(windAsync(function (req, res, next) {
                req.rHandler = req.rHandler || new RouterHandler(req, res, next);
                try {
                    $await(req.rHandler[sMethod](req, res, next));
                } catch (e) {
                    // Task.whenAll 会打包错误，这里只展示第一个
                    if (e.children && e.children.length > 0) {
                        return next(e.children[0]);
                    }
                    next(e);
                }
            }));
            
            var aFilter = oConf.filter[sMethod].map(function (fItem) {
                var fTask = eval(windAsync(function (req, res, next) {
                    req.rHandler = req.rHandler || new RouterHandler(req, res, next);
                    try {
                        $await(fItem.call(req.rHandler, req, res, next));
                    } catch (e) {
                        // Task.whenAll 会打包错误，这里只展示第一个
                        if (e.children && e.children.length > 0) {
                            return next(e.children[0]);
                        }
                        next(e);
                    }
                }));
               return function (req, res, next) {
                   fTask(req, res, next).start();
               };
            });
            
            var sRoutePath = oConf.route[sMethod];
            aRoutes.push(sRoutePath);
            oRouteParam[sMethod + ':' + sRoutePath] = [sRoutePath].concat(aFilter).concat([function (req, res, next) {
                fActionTask(req, res, next).start();
            }]);
            aFilter.length = 0;
            oConf.filter[sMethod].length = 0;
        });
    });
    
    // 排个序，所有同级带参数的都放在最后
    aRoutes.sort();

    // 注册路由
    var sRoute, aParam;
    var nIndex = 0;
    for (var i = aRoutes.length - 1; i >= 0; i--) {
        sRoute = aRoutes[i];

        aParam = oRouteParam['get:' + sRoute];
        if (aParam && aParam.length > 0) {
            nIndex++;
            console.log(nIndex + '.get: ' + sRoute);
            app.get.apply(app, aParam);
            aParam.length = 0;
        }

        aParam = oRouteParam['post:' + sRoute];
        if (aParam && aParam.length > 0) {
            nIndex++;
            console.log(nIndex + '.post: ' + sRoute);
            app.post.apply(app, aParam);
            aParam.length = 0;
        }

        aRoutes[i] = null;
    }

    oRouteParam = null;
    aRoutes.length = 0;
}

function fParser(sFile, sCtrDir, sFltDir) {
    sFile = sFile.replace(/\/index\.(js|coffee)$/, '');
    var oModule = require(sFile);
    if (util.isFunction(oModule)) {
        oModule = {
            get: { action: oModule }
        };
    }

    if (!oModule || !util.isObject(oModule) || oModule.ignore) {
        return;
    }

    // 默认的结构
    var oConf = {
        filter: {},
        route: {},
        get: null,
        post: null
    };

    // 获取路径，并去掉所有的 /index 开头的路径
    var sPath = sFile.replace(sCtrDir.replace(/\/$/, ''), '').replace(/\.(js|coffee)$/, '');
    var aPathPart = sPath.split('/');
    var sFileName = aPathPart.pop();
    sFileName = sFileName === 'index' ? '/' : sFileName;
    sPath = aPathPart.filter(function (sItem) { return sItem !== 'index'; }).join('/').replace(/^(?:\/index)+/g, '');

    // 获取最终的路径
    var sDefaultPath = oModule.route ? oModule.route : sPath + '/' + (oModule.name || sFileName).replace(/^\//, '');
    if (sDefaultPath !== '/') {
        sDefaultPath = sDefaultPath.replace(/\/$/, '');
    }
    
    // 公用拦截器
    var aCommonFilter = oModule.filter || [];
    
    // 只处理 get 和 post 请求
    ['get', 'post'].forEach(function (sMethod) {
        if (!oModule[sMethod]) {
            return;
        }
        
        // 改成标准形式
        var oRouterData = oModule[sMethod];
        if (util.isFunction(oRouterData)) {
            oRouterData = { action: oRouterData };
        }
        
        var fAction = oRouterData.action;
        var sRoute = oRouterData.route;
        var sRoutePath = sRoute ? '/' + sRoute.replace(/^\/+/, '').replace(/\/$/, '') : sDefaultPath;
        
        // 没有对应的处理方法，不做路由绑定
        if (!fAction) {
            console.info(sRoutePath + ' 没有对应的 action 方法，不做绑定');
            return;
        }

        if (util.isString(fAction)) {
            fAction = oModule[fAction];
        }

        if (!util.isFunction(fAction)) {
            console.info(sRoutePath + ' 没有对应的 action 方法，不做绑定');
            return;
        }
        
        // 过滤器
        var aFilter = aCommonFilter.concat(oRouterData.filter || []);
        aFilter = aFilter.length === 0 ? [] : aFilter.map(function (sItem) {
            return util.isString(sItem) ? require(sFltDir + '/' + sItem) :
                util.isFunction(sItem) ? sItem : null;
        }).filter(function (oItem) {
            return oItem !== null;
        });

        oConf.filter[sMethod] = aFilter;
        oConf.route[sMethod] = sRoutePath;
        oConf[sMethod] = fAction;
    });

    return oConf;
}
